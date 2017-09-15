import { setup as setupdb } from './db';
import * as dc from './documentClient';


export default function (config = {}) {
  setupdb(
    config.accessKey || 'cUniqueSessionID',
    config.secret || 'SECRET',
    config.region || 'us-west-2',
    config.endpoint || 'http://localhost:8000'
  );
  return dc;
}
