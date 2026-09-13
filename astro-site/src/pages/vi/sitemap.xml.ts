import {pageSitemap} from '../../data/page-sitemap';
export const GET=()=>new Response(pageSitemap('vi'),{headers:{'Content-Type':'application/xml; charset=utf-8'}});
