exports.up = (pgm) => {
  pgm.addColumns('candidate_profiles', {
    education: {
      type: 'text',
    },
    work_experience: {
      type: 'jsonb',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('candidate_profiles', [
    'education',
    'work_experience',
  ]);
};