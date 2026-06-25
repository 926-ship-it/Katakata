export type NarrativeStyle = "mythology" | "cultural" | "academic";

export const NARRATIVE_TERMS = {
  // Shrine name / central hub
  hubName: {
    mythology: "和鸣神社游艺场",
    cultural: "和风纸牌游艺阁",
    academic: "五十音拼写测试馆"
  },
  hubSubtitle: {
    mythology: "和鸣神社游艺场（温故双雄）",
    cultural: "风雅和歌纸牌游艺阁",
    academic: "五十音拼写与记忆演练场"
  },
  // Coins name
  coinName: {
    mythology: "和币",
    cultural: "岁币",
    academic: "积分"
  },
  coinDescription: {
    mythology: "我的和币：在个人收藏馆中用于召唤卡包或强化卡牌等级",
    cultural: "我的岁币：在个人收藏馆中用于兑换风雅和歌卡包或升级卡牌",
    academic: "我的学习积分：在卡牌图鉴中用于解锁教学卡包或升级卡牌"
  },
  // Mascot guardian / assistant
  mascotRole: {
    mythology: "守护灵",
    cultural: "伴学玩偶",
    academic: "助学助手"
  },
  mascotName: {
    mythology: "守护灵福狸酱",
    cultural: "玩偶福狸酱",
    academic: "学习助手福狸酱"
  },
  mascotTip: {
    mythology: "守护灵福狸酱已召唤 - 点击收回",
    cultural: "伴学玩偶福狸酱已召唤 - 点击收回",
    academic: "助学助手福狸酱已开启 - 点击关闭"
  },
  // Game complete / Deities' blessing
  rewardSource: {
    mythology: "神明赐予的修行奖赏",
    cultural: "岁时流光给予的丰硕成果",
    academic: "拼写熟练度练习奖励"
  },
  rewardSourceCoins: {
    mythology: "神明赐予的和币赏赐",
    cultural: "风雅和风岁币赏赐",
    academic: "系统结算的学习积分"
  },
  perfectBonus: {
    mythology: "达成完美三颗星，已额外增加 +35 满星完美和币大加成！",
    cultural: "达成完美三颗星，已获得 +35 满星完美岁币大加成！",
    academic: "获得三星完美评分，已额外获得 +35 满分积分加成！"
  },
  shrineSundial: {
    mythology: "五十音守卫集结！古老的神社日晷已经启动",
    cultural: "和风假名集结！古典的时令日晷已经开启",
    academic: "假名拼写挑战！答题倒计时器已经启动"
  },
  clockTitle: {
    mythology: "古风日晷神明时钟",
    cultural: "流光古典日晷",
    academic: "极速拼写倒计时"
  },
  gachaTitle: {
    mythology: "天道神珍宿命包",
    cultural: "风雅和歌收藏包",
    academic: "五十音专业学习包"
  },
  gachaDesc: {
    mythology: "向神明奉纳 150 和币，即可召唤一次由神明随机降下、饱含文化历史深度的小和卡包！",
    cultural: "支付 150 岁币，即可兑换一盒精心挑选、饱含传统文化底蕴的风雅和歌卡包！",
    academic: "消耗 150 学习积分，即可解锁一套内容丰富、饱含语音与历史释义的专业学习卡包！"
  },
  summonButton: {
    mythology: "虔诚奉纳 150 和币 召唤卡包",
    cultural: "消耗 150 岁币 兑换卡包",
    academic: "消耗 150 积分 解锁卡包"
  },
  // Card upgrading related
  shrineLevel: {
    mythology: "神庙感应等级",
    cultural: "文化契合度",
    academic: "卡牌掌握度"
  },
  shrineExp: {
    mythology: "神道修行熟练值",
    cultural: "国风研习度",
    academic: "拼写记忆经验"
  },
  shrineGrade: {
    mythology: "神力品阶",
    cultural: "风雅品级",
    academic: "掌握级别"
  },
  onlineTime: {
    mythology: "入殿修行",
    cultural: "执笔研习",
    academic: "本次在线"
  }
};

export const nTrans = (
  key: keyof typeof NARRATIVE_TERMS,
  style: NarrativeStyle
): string => {
  return NARRATIVE_TERMS[key]?.[style] || "";
};
