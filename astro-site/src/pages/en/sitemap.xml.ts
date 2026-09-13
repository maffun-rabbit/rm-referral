import {pageSitemap} from '../../data/page-sitemap';
export const GET=()=>new Response(pageSitemap('en'),{headers:{'Content-Type':'application/xml; charset=utf-8'}});
