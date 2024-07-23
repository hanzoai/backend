"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateFT2Hanzo = exports.checkIfFTMigrationRequired = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const HANZO_SETTINGS = "_hanzo_/settings";
const HANZO_TABLE_SCHEMAS = `${HANZO_SETTINGS}/schema`;
const HANZO_GROUP_TABLE_SCHEMAS = `${HANZO_SETTINGS}/groupSchema`;
const FT_SETTINGS = "_FIRETABLE_/settings";
const FT_TABLE_SCHEMAS = `${FT_SETTINGS}/schema`;
const FT_GROUP_TABLE_SCHEMAS = `${FT_SETTINGS}/groupSchema`;
const checkIfFTMigrationRequired = async (req, res) => {
    const ftSettingsExists = (await firebaseConfig_1.db.doc(FT_SETTINGS).get()).exists;
    if (!ftSettingsExists)
        return res.send({
            migrationRequired: false,
            message: "Firetable Settings doesn't exist",
        });
    const migrated = (await firebaseConfig_1.db.doc(HANZO_SETTINGS).get()).data()?.migratedToV2 !== undefined;
    if (migrated)
        return res.send({
            migrationRequired: false,
            message: "Firetable Settings has already been migrated",
        });
    const tableSchemas = (await firebaseConfig_1.db.collection(FT_TABLE_SCHEMAS).get()).size;
    const groupTableSchemas = (await firebaseConfig_1.db.collection(FT_GROUP_TABLE_SCHEMAS).get())
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
exports.checkIfFTMigrationRequired = checkIfFTMigrationRequired;
const migrateFT2Hanzo = async () => {
    const migrated = (await firebaseConfig_1.db.doc(HANZO_SETTINGS).get()).data()?.migratedToV2 !== undefined;
    if (migrated)
        throw new Error("Migration has already been done");
    const ftSettingsDoc = await firebaseConfig_1.db.doc(FT_SETTINGS).get();
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
    await firebaseConfig_1.db.doc(HANZO_SETTINGS).set({ tables: newTables }, { merge: true });
    const tables = await firebaseConfig_1.db.collection(FT_TABLE_SCHEMAS).get();
    const groupTables = await firebaseConfig_1.db.collection(FT_GROUP_TABLE_SCHEMAS).get();
    const promises = [
        ...tables.docs.map((table) => firebaseConfig_1.db
            .collection(HANZO_TABLE_SCHEMAS)
            .doc(table.id)
            .set(table.data(), { merge: true })),
        ...groupTables.docs.map((table) => firebaseConfig_1.db
            .collection(HANZO_GROUP_TABLE_SCHEMAS)
            .doc(table.id)
            .set(table.data(), { merge: true })),
    ];
    await Promise.all(promises);
    const subtables = await firebaseConfig_1.db.collectionGroup("subTables").get();
    const addedSubtables = subtables.docs.map((subtable) => {
        return firebaseConfig_1.db
            .doc(subtable.ref.path.replace("_FIRETABLE_", "_hanzo_"))
            .set(subtable.data());
    });
    await Promise.all(addedSubtables);
    await firebaseConfig_1.db.doc(HANZO_SETTINGS).update({ migratedToV2: true });
    return { success: true };
};
exports.migrateFT2Hanzo = migrateFT2Hanzo;
//# sourceMappingURL=ft2hanzo.js.map