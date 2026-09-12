import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const data={
en:{home:"Home",title:"Rakuten Mobile Device Replacement Program",lead:"Understand the payments, return requirements and costs before choosing a new phone.",sections:[
["How it works","Buy an eligible phone in 48 instalments with a Rakuten Card in your own name. From month 25, returning the device and meeting the assessment requirements can waive up to 24 remaining instalments. This is not a purchase where paying half lets you keep the phone."],
["Return it or keep it?","If you return the device, an administration fee applies and damage may result in additional charges or rejection. If you keep it, continue paying all 48 instalments. Cancelling your mobile service does not cancel the device payments."],
["A simple cost example","For an illustrative ¥120,000 phone with equal payments, ¥2,500 × 24 plus a ¥3,300 return fee is ¥63,300. You return the phone. This excludes damage charges and mobile service fees; actual payment schedules vary by product and promotion."],
["Check before applying","Apply when purchasing an eligible device; you cannot join afterwards. Check the model, payment schedule and return conditions. Damage charges can be ¥22,000 or more depending on the model and condition, and some devices cannot be accepted."],
["Prepare for return","Back up your data, remove account locks and reset the phone. Follow the return instructions and deadline. Compare the total cost with buying outright, especially if you want to keep the phone for several years."]],
related:"Related guides",android:"Android eligibility",cons:"Disadvantages and precautions",source:"Official program terms (Japanese)",date:"Checked: 13 September 2026. Conditions may change."},
zh:{home:"首页",title:"乐天手机换新超值计划指南",lead:"选购新手机前，先了解分期付款、归还条件与实际费用。",sections:[
["计划如何运作","使用本人名下的乐天信用卡，将符合条件的手机分48期购买。从第25个月起归还设备并符合验收标准，可免除最多24期剩余款项。这并不意味着支付一半价格后就能保留手机。"],
["归还还是继续使用？","归还设备需要支付手续费；设备损坏可能产生额外费用，或无法回收。不归还则继续支付全部48期款项。取消手机通信套餐并不会免除设备分期付款。"],
["一个简单的费用例子","假设手机售价120,000日元、每期金额相同，支付2,500日元×24期，再加3,300日元归还手续费，共63,300日元，且需归还手机。本例不含损坏费用和通信费；实际分期金额因产品和活动而异。"],
["申请前要确认什么？","必须在购买符合条件的产品时加入，购买后不能补办。确认机型、付款安排和归还要求。故障费用可能为22,000日元或更高，取决于机型及设备状态；部分设备无法回收。"],
["归还前的准备","备份数据、解除账户锁定并恢复出厂设置，按指定方式在期限内归还。如果打算使用同一部手机多年，也应比较一次性购买与本计划的总费用。"]],
related:"相关阅读",android:"Android设备适用条件",cons:"缺点与注意事项",source:"官方计划条款（日语）",date:"核对日期：2026年9月13日。条件可能调整。"},
ko:{home:"홈",title:"라쿠텐 모바일 기기 교체 프로그램 안내",lead:"새 휴대전화를 고르기 전에 할부금, 반납 조건과 비용을 확인하세요.",sections:[
["어떤 프로그램인가요?","본인 명의의 라쿠텐 카드로 대상 기기를 48회 할부 구매합니다. 25개월째부터 기기를 반납하고 심사 조건을 충족하면 남은 할부금 중 최대 24회분이 면제됩니다. 절반만 내고 기기를 소유하는 제도는 아닙니다."],
["반납하거나 계속 사용하기","반납 시 사무 수수료가 있으며, 파손 상태에 따라 추가 비용이 발생하거나 반납이 거절될 수 있습니다. 반납하지 않으면 48회분을 모두 납부합니다. 통신 회선을 해지해도 기기 할부금은 남습니다."],
["간단한 비용 예시","120,000엔 기기를 매달 같은 금액으로 납부한다고 가정하면 2,500엔×24회에 반납 수수료 3,300엔을 더해 63,300엔입니다. 기기는 반납해야 합니다. 파손 비용과 통신료는 제외하며, 실제 할부 금액은 제품과 행사에 따라 다릅니다."],
["신청 전에 확인하세요","대상 기기를 구매할 때 가입해야 하며 나중에 추가할 수 없습니다. 대상 모델, 납부 일정과 반납 조건을 확인하세요. 파손 비용은 모델과 상태에 따라 22,000엔 이상일 수 있으며, 일부 기기는 회수되지 않습니다."],
["반납 준비","데이터를 백업하고 계정 잠금을 해제한 뒤 초기화하세요. 안내된 방법과 기한을 지켜 반납해야 합니다. 같은 기기를 여러 해 사용할 계획이라면 일시불 구매와 총비용을 비교하세요."]],
related:"관련 안내",android:"Android 대상 기기 확인",cons:"단점과 주의사항",source:"공식 프로그램 약관 (일본어)",date:"확인일: 2026년 9월 13일. 조건은 변경될 수 있습니다."},
vi:{home:"Trang chủ",title:"Chương trình đổi điện thoại của Rakuten Mobile",lead:"Hiểu khoản trả góp, điều kiện trả máy và chi phí trước khi chọn điện thoại mới.",sections:[
["Chương trình hoạt động thế nào?","Mua điện thoại đủ điều kiện bằng 48 kỳ trả góp với thẻ Rakuten Card đứng tên bạn. Từ tháng thứ 25, nếu trả máy và đáp ứng tiêu chuẩn kiểm tra, bạn có thể được miễn tối đa 24 kỳ còn lại. Đây không phải cách trả nửa giá rồi giữ điện thoại."],
["Trả máy hay tiếp tục dùng?","Khi trả máy có phí thủ tục. Máy hỏng có thể bị tính thêm phí hoặc không được tiếp nhận. Nếu giữ máy, bạn thanh toán đủ 48 kỳ. Hủy thuê bao di động không làm chấm dứt khoản trả góp thiết bị."],
["Ví dụ chi phí","Giả sử máy giá 120.000 yên và mỗi kỳ bằng nhau: 2.500 yên × 24 kỳ + phí trả máy 3.300 yên = 63.300 yên. Bạn phải trả lại máy. Ví dụ chưa gồm phí hư hỏng và cước di động; lịch thanh toán thực tế tùy sản phẩm và ưu đãi."],
["Kiểm tra trước khi đăng ký","Bạn phải tham gia khi mua thiết bị đủ điều kiện, không thể đăng ký thêm sau đó. Kiểm tra mẫu máy, lịch trả góp và yêu cầu trả máy. Phí hư hỏng có thể là 22.000 yên hoặc cao hơn tùy mẫu và tình trạng; một số máy không được thu hồi."],
["Chuẩn bị trả máy","Sao lưu dữ liệu, gỡ khóa tài khoản rồi khôi phục cài đặt gốc. Gửi trả theo hướng dẫn và đúng hạn. Nếu muốn dùng một máy nhiều năm, hãy so sánh tổng chi phí với mua trả thẳng."]],
related:"Bài hướng dẫn liên quan",android:"Điều kiện dành cho Android",cons:"Nhược điểm và lưu ý",source:"Điều khoản chính thức (tiếng Nhật)",date:"Kiểm tra ngày 13/09/2026. Điều kiện có thể thay đổi."},
pt:{home:"Início",title:"Programa de troca de aparelhos da Rakuten Mobile",lead:"Entenda as prestações, as condições de devolução e os custos antes de escolher um novo celular.",sections:[
["Como funciona?","Compre um aparelho elegível em 48 prestações usando um Rakuten Card em seu nome. A partir do 25º mês, a devolução do aparelho, sujeita à avaliação, pode dispensar até 24 prestações restantes. Pagar metade não significa ficar com o celular."],
["Devolver ou continuar usando?","A devolução tem taxa administrativa. Danos podem gerar cobrança adicional ou impedir a aceitação. Se ficar com o aparelho, pague todas as 48 prestações. Cancelar a linha móvel não cancela a dívida do aparelho."],
["Exemplo de custo","Para um aparelho hipotético de ¥120.000 com prestações iguais: ¥2.500 × 24 + taxa de devolução de ¥3.300 = ¥63.300. O aparelho deve ser devolvido. Danos e serviço móvel não estão incluídos; o calendário real depende do produto e da promoção."],
["Antes de aderir","A adesão deve ocorrer na compra de um aparelho elegível; não pode ser feita depois. Confira o modelo, as prestações e as regras de devolução. Danos podem custar ¥22.000 ou mais, conforme o modelo e o estado; alguns aparelhos não são aceitos."],
["Prepare a devolução","Faça backup, remova os bloqueios de conta e restaure as configurações de fábrica. Siga as instruções e o prazo de devolução. Se pretende usar o mesmo celular por vários anos, compare o custo total com uma compra à vista."]],
related:"Guias relacionados",android:"Elegibilidade de aparelhos Android",cons:"Desvantagens e cuidados",source:"Condições oficiais (em japonês)",date:"Verificado em 13/09/2026. As condições podem mudar."}
};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
for(const [locale,t] of Object.entries(data)){
const url='https://mnp-navi.jp/'+locale+'/guide/replacement-program/';
const html=`<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(t.title)}</title><meta name="description" content="${esc(t.lead)}"><link rel="canonical" href="${url}">${Object.keys(data).map(l=>`<link rel="alternate" hreflang="${l}" href="https://mnp-navi.jp/${l}/guide/replacement-program/">`).join('')}<meta property="og:title" content="${esc(t.title)}"><meta property="og:description" content="${esc(t.lead)}"><meta property="og:url" content="${url}"><link rel="stylesheet" href="/${locale}/css/style.css"><style>.localized-program{max-width:900px;margin:auto;padding:32px 24px 64px;font-size:17px;line-height:1.75}.localized-program h1{font-size:clamp(32px,5vw,44px);line-height:1.35;overflow-wrap:anywhere}.localized-program h2{font-size:26px;line-height:1.4;margin-top:48px}.localized-program .lead{font-size:21px}.localized-program nav{display:flex;gap:16px;flex-wrap:wrap}.localized-program a{overflow-wrap:anywhere}.localized-program footer{margin-top:48px;font-size:16px;border-top:1px solid #ddd;padding-top:24px}</style><script async src="https://www.googletagmanager.com/gtag/js?id=G-86FFC09LTE"></script><script src="/${locale}/js/analytics.js"></script></head><body><main class="localized-program"><nav><a href="/${locale}/">${esc(t.home)}</a>${Object.keys(data).map(l=>`<a href="/${l}/guide/replacement-program/" lang="${l}"${l===locale?' aria-current="page"':''}>${l.toUpperCase()}</a>`).join('')}</nav><h1>${esc(t.title)}</h1><p class="lead">${esc(t.lead)}</p>${t.sections.map(([h,p])=>`<section><h2>${esc(h)}</h2><p>${esc(p)}</p></section>`).join('')}<section><h2>${esc(t.related)}</h2><ul><li><a href="/${locale}/guide/topics/replacement-program-android/">${esc(t.android)}</a></li><li><a href="/${locale}/guide/topics/replacement-program-disadvantages/">${esc(t.cons)}</a></li></ul></section><footer><p>${esc(t.date)}</p><a href="https://network.mobile.rakuten.co.jp/service/replacement-program/" rel="noopener">${esc(t.source)}</a></footer></main></body></html>`;
await mkdir(path.join(root,locale,'guide/replacement-program'),{recursive:true});
await writeFile(path.join(root,locale,'guide/replacement-program/index.html'),html+'\n');
}
