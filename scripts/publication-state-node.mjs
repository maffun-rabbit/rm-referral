import {createHash} from 'node:crypto';

export function publicationStateSha256(state){
  return createHash('sha256').update(JSON.stringify(state)).digest('hex');
}
