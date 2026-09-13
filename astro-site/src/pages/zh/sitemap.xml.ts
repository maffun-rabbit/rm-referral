import {pageSitemap} from '../../data/page-sitemap';
export const GET=()=>new Response(pageSitemap('zh'),{headers:{'Content-Type':'application/xml; charset=utf-8'}});
