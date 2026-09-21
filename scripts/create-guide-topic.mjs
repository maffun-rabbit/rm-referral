import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { locales, overrideFile, validateSource } from './page-sources.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [locale,slug]=process.argv.slice(2);
if(!locales.includes(locale)||!slug||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)){console.error('Usage: npm run page:new-topic -- <ja|en|zh|ko|vi|pt> <lowercase-slug>');process.exit(1);}
const route=`topics/${slug}`;
const file=overrideFile(locale,route);
if(existsSync(file)){console.error('Refusing to overwrite: '+file);process.exit(1);}
const today=new Date().toISOString().slice(0,10);
const source={locale,route,pageType:'guide-topic-v1',title:'TODO: page title',description:'TODO: page description',robots:'noindex, nofollow',schemas:[],styles:[],scripts:[],topic:{
 breadcrumb:{ariaLabel:'Breadcrumb',home:'Home',topics:'Topics',current:'TODO'},
 hero:{eyebrow:'GUIDE',heading:'TODO: heading',lead:'TODO: one-sentence answer',primaryActionLabel:'Read the guide',sourceActionLabel:'Check sources',summaryLabel:'Three key points',points:['TODO: point 1','TODO: point 2','TODO: point 3']},
 sections:[{id:'answer',type:'prose',eyebrow:'ANSWER',heading:'TODO: answer first',paragraphs:['TODO: explain the conclusion clearly.']},{id:'steps',type:'steps',eyebrow:'STEPS',heading:'TODO: what to do',items:[{title:'TODO: step 1',body:'TODO: action and reason.'}]},{id:'questions',type:'faq',eyebrow:'FAQ',heading:'TODO: common questions',items:[{question:'TODO: question',answer:'TODO: answer'}]}],
 sources:{eyebrow:'SOURCES',heading:'Check the latest official information',description:'Conditions can change. Confirm the latest details before applying.',updatedLabel:'Information checked',items:[{label:'TODO: official source',href:'https://example.com/',external:true}]},updatedAt:today,
 cta:{eyebrow:'NEXT STEP',heading:'TODO: next action',body:'TODO: explain what happens after clicking.',link:{label:'TODO: CTA label',href:'/'},disclosure:''},
 related:{eyebrow:'RELATED',heading:'Related guides',linkLabel:'Read guide',items:[{title:'TODO: related guide',summary:'TODO: why it is related',href:'/'}]}
}};
validateSource(source,{isOverride:true});mkdirSync(path.dirname(file),{recursive:true});writeFileSync(file,JSON.stringify(source,null,2)+'\n');console.log(path.relative(root,file));
