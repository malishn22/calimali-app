export const getLevelRank = (level: number): string => {
  if (level >= 100) return "GODLIKE";
  if (level >= 90) return "MYTHIC";
  if (level >= 80) return "IMMORTAL";
  if (level >= 70) return "TITAN";
  if (level >= 60) return "LEGEND";
  if (level >= 50) return "MASTER";
  if (level >= 40) return "ELITE";
  if (level >= 30) return "VETERAN";
  if (level >= 20) return "WARRIOR";
  if (level >= 10) return "CHALLENGER";
  if (level >= 5) return "ROOKIE";
  return "BEGINNER";
};

export const getLevelRequirement = (level: number) => {
  // Level 1 to 2: 500 XP.
  // Level 2 to 3: 750 XP. (Total 1250)
  // Level 3 to 4: 1000 XP. (Total 2250)
  return 500 + (level - 1) * 250;
};

export const calculateLevel = (totalXP: number) => {
  let level = 1;
  let xp = totalXP;
  while (true) {
    const req = getLevelRequirement(level);
    if (xp >= req) {
      xp -= req;
      level++;
    } else {
      break;
    }
  }
  return level;
};
