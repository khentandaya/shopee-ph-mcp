import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { shopeeCapture, shopeeUrl } from '../api/client.js';
import { BASE_URL, LOCALE, captureJson } from '../browser/session.js';
import { cache } from '../utils/cache.js';
import { withErrorHandling, truncate } from '../utils/errors.js';
import { flattenSearchItems, formatResultList } from './search.js';
import type { SearchItemsResponse, ShopBase, ShopBaseResponse } from '../api/types.js';

/** Shop listing sort → the shop search page's params (note "pop", not "relevancy"). */
const SHOP_SORT_MAP: Record<string, { sortBy: string; order?: string }> = {
  popular: { sortBy: 'pop' },
  newest: { sortBy: 'ctime' },
  top_sales: { sortBy: 'sales' },
  price_low: { sortBy: 'price', order: 'asc' },
  price_high: { sortBy: 'price', order: 'desc' },
};

/** "2h", "3 days" — Shopee reports response time in seconds. */
export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  return `${Math.round(hours / 24)} days`;
}

/** Render a shop profile. `now` is injectable so tests are deterministic. */
export function formatShop(s: ShopBase, now: number = Date.now()): string {
  const badges = [
    s.is_official_shop ? 'Shopee Mall' : '',
    s.is_preferred_plus_seller ? 'Star+' : '',
    s.is_shopee_verified ? 'Verified' : '',
  ].filter(Boolean);
  const username = s.account?.username;
  const lines = [
    `🏪 **${s.name}**${badges.length ? ` [${badges.join(', ')}]` : ''}`,
    username ? `👤 @${username}` : '',
    '',
    `📊 **Stats:**`,
    s.rating_star ? `  ⭐ Shop rating: ${s.rating_star.toFixed(2)}` : '',
    s.item_count !== undefined ? `  📦 Products: ${s.item_count.toLocaleString(LOCALE)}` : '',
    s.follower_count !== undefined
      ? `  👥 Followers: ${s.follower_count.toLocaleString(LOCALE)}`
      : '',
    s.response_rate !== undefined
      ? `  💬 Chat response: ${s.response_rate}%${s.response_time ? ` (within ~${formatDuration(s.response_time)})` : ''}`
      : '',
    s.ctime ? `  📅 Joined: ${new Date(s.ctime * 1000).toISOString().slice(0, 10)}` : '',
    s.last_active_time
      ? `  🕒 Last active: ${formatDuration(Math.max(0, now / 1000 - s.last_active_time))} ago`
      : '',
    s.vacation ? '  🏖 On vacation — orders may be delayed' : '',
    `  🆔 Shop ID: \`${s.shopid}\``,
  ];
  const desc = s.description?.replace(/\s+/g, ' ').trim();
  if (desc) lines.push('', '📝 **About:**', truncate(desc, 400));
  lines.push(
    '',
    `🔗 ${BASE_URL}/${username ?? `shop/${s.shopid}`}`,
    '💡 Use get_shop_products to browse this shop’s listings.',
  );
  // Drop empty rows, but keep the intentional blank separators.
  return lines.filter((l, i) => l !== '' || (i > 0 && lines[i - 1] !== '')).join('\n');
}

export function registerShopTools(server: McpServer): void {
  server.tool(
    'get_shop_info',
    'Get a Shopee seller’s profile: name, Shopee Mall / Star+ / verified badges, shop rating, product and follower ' +
      'counts, chat response rate and time, join date, last active, vacation status, and description. ' +
      'Takes the numeric shopId (shown by search_products / get_product_detail) or the shop’s username.',
    {
      shopId: z.string().optional().describe('Numeric shop ID'),
      username: z
        .string()
        .optional()
        .describe('Shop username — the part after the domain in the shop URL'),
    },
    { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    async ({ shopId, username }) => {
      return withErrorHandling(async () => {
        const handle = username?.replace(/^@/, '').trim();
        if (!shopId && !handle) {
          return {
            content: [
              { type: 'text' as const, text: '❌ Please provide a `shopId` or a shop `username`.' },
            ],
          };
        }

        const cacheKey = cache.key('shop', shopId ?? `@${handle}`);
        const cached = cache.get<string>(cacheKey);
        if (cached) return { content: [{ type: 'text' as const, text: cached }] };

        const path = shopId ? `/shop/${shopId}` : `/${encodeURIComponent(handle!)}`;
        // Shop profiles are the one read Shopee still serves anonymously, so skip
        // the signed-out fast-fail: this works in read-only mode without a login.
        const data = await shopeeCapture<ShopBaseResponse>(
          shopeeUrl(path),
          'shop/get_shop_base_v2',
          undefined,
          false,
          captureJson,
          async () => true,
        );
        if (!data.data?.shopid) {
          return {
            content: [
              {
                type: 'text' as const,
                text: '❌ Could not read shop data. Check the shopId or username.',
              },
            ],
          };
        }

        const text = formatShop(data.data);
        cache.set(cacheKey, text);
        return { content: [{ type: 'text' as const, text }] };
      });
    },
  );

  server.tool(
    'get_shop_products',
    'List the products a Shopee shop sells, with sorting and pagination — names, prices, sold counts, ratings, ' +
      'product IDs, and URLs. Use it to browse one seller’s catalogue after search_products or get_shop_info.',
    {
      shopId: z.string().min(1).describe('Numeric shop ID'),
      page: z.number().int().min(1).default(1).describe('Page number (default: 1)'),
      limit: z
        .number()
        .int()
        .min(1)
        .max(60)
        .default(20)
        .describe('Max results to show from the page, 1-60 (default: 20)'),
      sort: z
        .enum(['popular', 'newest', 'top_sales', 'price_low', 'price_high'])
        .default('popular')
        .describe('Sort order (default: popular)'),
    },
    { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    async ({ shopId, page, limit, sort }) => {
      return withErrorHandling(async () => {
        const cacheKey = cache.key('shop-products', shopId, page, limit, sort);
        const cached = cache.get<string>(cacheKey);
        if (cached) return { content: [{ type: 'text' as const, text: cached }] };

        // /shop/<id>/search redirects here; going direct saves a hop.
        const { sortBy, order } = SHOP_SORT_MAP[sort] ?? SHOP_SORT_MAP.popular;
        const qs = new URLSearchParams({ shop: shopId, page: String(page - 1), sortBy });
        if (order) qs.set('order', order);
        const data = await shopeeCapture<SearchItemsResponse>(
          shopeeUrl(`/search?${qs.toString()}`),
          'search/search_items',
        );

        const items = flattenSearchItems(data.items);
        if (items.length === 0) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `No products found for shop \`${shopId}\`${page > 1 ? ` on page ${page}` : ''}.`,
              },
            ],
          };
        }

        const text = formatResultList(items, {
          title: `🏪 Products from shop \`${shopId}\``,
          page,
          limit,
          totalCount: data.total_count ?? 0,
          nomore: data.nomore,
        });
        cache.set(cacheKey, text);
        return { content: [{ type: 'text' as const, text }] };
      });
    },
  );
}
