import { writeFileSync } from 'node:fs';
import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2026-09-05' }).withConfig({ useCdn: false, perspective: 'raw' });
if (client.config().projectId !== 'lwe89m68' || client.config().dataset !== 'production') throw new Error('Unexpected project or dataset.');
const documents = await client.fetch('*[_type == "useCase" && (_id == "1vO0nM420B6tmj07YsUDDj" || _id == "drafts.1vO0nM420B6tmj07YsUDDj" || migrationSource == "legacy-case-study/french-wellness")]');
console.log('Case studies to delete:', documents.map((doc: { _id: string; title: string }) => ({ id: doc._id, title: doc.title })));
if (process.argv.includes('--write') && documents.length) {
  const backup = `/private/tmp/french-wellness-backup-${Date.now()}.json`;
  writeFileSync(backup, JSON.stringify(documents, null, 2), { mode: 0o600 });
  let transaction = client.transaction();
  for (const doc of documents) {
    transaction = transaction.patch(doc._id, (patch) => patch.ifRevisionId(doc._rev).set({ _type: 'useCase' })).delete(doc._id);
  }
  await transaction.commit();
  const remaining = await client.fetch('count(*[_id in $ids])', { ids: documents.map((doc: { _id: string }) => doc._id) });
  if (remaining !== 0) throw new Error('Deletion verification failed.');
  console.log(`Deleted and verified ${documents.length} document(s). Backup: ${backup}`);
}
