exports.up = (pgm) => {
  // The initial schema contains these columns for fresh installations. Existing
  // databases need this migration, so make it safe to run in either case.
  pgm.sql(`
    ALTER TABLE candidate_profiles
      ADD COLUMN IF NOT EXISTS education TEXT,
      ADD COLUMN IF NOT EXISTS work_experience JSONB;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE candidate_profiles
      DROP COLUMN IF EXISTS work_experience,
      DROP COLUMN IF EXISTS education;
  `);
};
