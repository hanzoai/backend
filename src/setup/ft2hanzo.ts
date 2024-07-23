// firetable migration
import { Request, Response } from "express";
import { db } from "../firebaseConfig";

const HANZO_SETTINGS = "_hanzo_/settings";
const HANZO_TABLE_SCHEMAS = `${HANZO_SETTINGS}/schema`;
const HANZO_GROUP_TABLE_SCHEMAS = `${HANZO_SETTINGS}/groupSchema`;
const FT_SETTINGS = "_FIRETABLE_/settings";
const FT_TABLE_SCHEMAS = `${FT_SETTINGS}/schema`;
const FT_GROUP_TABLE_SCHEMAS = `${FT_SETTINGS}/groupSchema`;

export const checkIfFTMigrationRequired = async (
  req: Request,
  res: Response
) => {
  const ftSettingsExists = (await db.doc(FT_SETTINGS).get()).exists;
  if (!ftSettingsExists)
    return res.send({
      migrationRequired: false,
      message: "Firetable Settings doesn't exist",
    });
  const migrated =
    (await db.doc(HANZO_SETTINGS).get()).data()?.migratedToV2 !== undefined;
  if (migrated)
    return res.send({
      migrationRequired: false,
      message: "Firetable Settings has already been migrated",
    });
  const tableSchemas = (await db.collection(FT_TABLE_SCHEMAS).get()).size;

  const groupTableSchemas = (await db.collection(FT_GROUP_TABLE_SCHEMAS).get())
    .size;
  if (tableSchemas + groupTableSchemas === 0)
    return res.send({
      migrationRequired: false,
      message: "Firetable Settings has no tables",
    });
  return res.send({
    migrationRequired: true,
    message: "Firetable Settings needs to be migrated",
  });
};

export const migrateFT2Hanzo = async () => {
  const migrated =
    (await db.doc(HANZO_SETTINGS).get()).data()?.migratedToV2 !== undefined;
  if (migrated) throw new Error("Migration has already been done");
  const ftSettingsDoc = await db.doc(FT_SETTINGS).get();
  const oldTables = ftSettingsDoc.get("tables");
  const newTables = oldTables.map((oldTable) => {
    const { table, collection, ...rest } = oldTable;
    return {
      id: collection,
      table,
      collection,
      ...rest,
    };
  });
  await db.doc(HANZO_SETTINGS).set({ tables: newTables }, { merge: true });
  const tables = await db.collection(FT_TABLE_SCHEMAS).get();
  const groupTables = await db.collection(FT_GROUP_TABLE_SCHEMAS).get();
  const promises = [
    ...tables.docs.map((table) =>
      db
        .collection(HANZO_TABLE_SCHEMAS)
        .doc(table.id)
        .set(table.data(), { merge: true })
    ),
    ...groupTables.docs.map((table) =>
      db
        .collection(HANZO_GROUP_TABLE_SCHEMAS)
        .doc(table.id)
        .set(table.data(), { merge: true })
    ),
  ];
  await Promise.all(promises);
  const subtables = await db.collectionGroup("subTables").get();
  const addedSubtables = subtables.docs.map((subtable) => {
    return db
      .doc(subtable.ref.path.replace("_FIRETABLE_", "_hanzo_"))
      .set(subtable.data());
  });
  await Promise.all(addedSubtables);
  await db.doc(HANZO_SETTINGS).update({ migratedToV2: true });
  return { success: true };
};
