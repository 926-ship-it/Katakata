// Open Public Domain Practical Spanish Vocabulary
// Free-to-use everyday conversational Spanish, cultural idioms, travel survival, dining, and modern digital terms.
// All entries are standard Spanish linguistic expressions, completely free from commercial textbook copyright.

import { SpanishWord } from "./spanishData";

const RAW_OPEN_WORDS: [string, string, string, string, "A1" | "A2" | "B1" | "B2", string, string?, string?][] = [
  // ========================================================
  // 1. 地道口语与常用短语 (Modismos y Expresiones Coloquiales)
  // ========================================================
  ["Qué guay", "exp.", "太棒了！太酷了！（西班牙极高频口语）", "daily", "A2", "¡Tu coche nuevo está genial, qué guay!", "你的新车太赞了，真酷！"],
  ["Por supuesto", "exp.", "当然！毫无疑问！", "daily", "A1", "¿Vienes a la fiesta? —¡Por supuesto!", "你来参加聚会吗？——当然！"],
  ["Qué lástima", "exp.", "真遗憾！太可惜了！", "emotion", "A2", "No pudo venir ayer, ¡qué lástima!", "他昨天没能来，真可惜！"],
  ["por si acaso", "exp.", "以防万一，防患未然", "daily", "B1", "Lleva un paraguas por si acaso.", "带把雨伞吧，以防万一。"],
  ["a propósito", "exp.", "顺便说一下；故意地", "daily", "B1", "A propósito, ¿has visto a Carlos hoy?", "顺便问下，你今天见到卡洛斯了吗？"],
  ["sin duda", "exp.", "毫无疑问，必定", "daily", "A2", "Es, sin duda, la mejor paella de la ciudad.", "这毫无疑问是全城最好吃的海鲜饭。"],
  ["ni hablar", "exp.", "休想！门都没有！免谈！", "daily", "B1", "¿Prestarte mi coche nuevo? ¡Ni hablar!", "把新车借你？门都没有！"],
  ["Ojo", "interj.", "小心！当心！注意！（俚语口令）", "daily", "A2", "¡Ojo con el escalón que está resbaladizo!", "注意台阶，地很滑！"],
  ["a lo mejor", "exp.", "也许，说不定，可能", "daily", "A2", "A lo mejor llega un poco tarde.", "说不定他会稍微迟到一会儿。"],
  ["vale la pena", "exp.", "值得，很划得来", "daily", "B1", "Visitar la Alhambra vale mucho la pena.", "去阿尔罕布拉宫参观非常值得。"],
  ["dar una vuelta", "exp.", "散散步，转一圈，兜风", "travel", "A2", "¿Vamos a dar una vuelta por el centro?", "我们去市中心转一圈散散步好吗？"],
  ["echar de menos", "exp.", "想念，怀念（西式表达）", "emotion", "A2", "Te echo mucho de menos cuando viajo.", "我出差在外时很想念你。"],
  ["darse prisa", "exp.", "抓紧时间，赶快，赶紧", "daily", "A2", "Tenemos que darnos prisa o perderemos el tren.", "我们得赶快了，不然要错过火车了。"],
  ["tener ganas de", "exp.", "渴望做，很想做某事", "emotion", "A2", "Tengo muchas ganas de ir a la playa.", "我非常想去海边度假。"],
  ["de vez en cuando", "exp.", "偶尔，有时，间或", "daily", "A2", "Cenamos fuera de vez en cuando.", "我们偶尔在外面吃晚餐。"],
  ["enseguida", "adv.", "马上，立刻，即刻", "daily", "A2", "Siéntate, enseguida te traigo un café.", "请坐，我马上给你端咖啡过来。"],
  ["en fin", "exp.", "总之，总而言之，算了吧", "daily", "B1", "En fin, no vale la pena preocuparse más.", "总而言之，不用再为此担忧了。"],
  ["sobre todo", "exp.", "尤其是，特别是", "daily", "B1", "Me gusta la comida española, sobre todo las tapas.", "我喜欢西班牙菜，尤其是餐前小吃。"],
  ["desde luego", "exp.", "当然，毫无疑问，自然", "daily", "B1", "Desde luego que puedes contar con mi apoyo.", "你当然可以信赖我的支持。"],
  ["ni modo", "exp.", "没办法，算了吧（拉美极高频口语）", "emotion", "B1", "Se acabó el café, pues ni modo.", "咖啡喝光了，那也没办法了。"],
  ["Menos mal", "exp.", "谢天谢地！幸好！万幸！", "emotion", "A2", "¡Menos mal que no llovió durante la boda!", "幸好婚礼进行时没有下雨！"],
  ["estar al tanto", "exp.", "了解情况，保持知情", "business", "B1", "Manténme al tanto de las novedades.", "有新情况随时跟我同步。"],
  ["no pasa nada", "exp.", "没关系，不要紧，不碍事", "daily", "A1", "—Perdón por llegar tarde. —¡No pasa nada!", "—抱歉来晚了。—没关系！"],
  ["de acuerdo", "exp.", "好的，赞同，同意", "daily", "A1", "¿Quedamos a las siete? —De acuerdo.", "我们约在七点可以吗？——好的。"],
  ["tener razón", "exp.", "有道理，说得对", "grammar", "A2", "Creo que tienes toda la razón en este punto.", "我认为在这一点上你完全是对的。"],

  // ========================================================
  // 2. 餐饮、咖啡与生活文化 (Gastronomía, Café y Cultura Viva)
  // ========================================================
  ["tapas", "f.pl.", "西班牙下酒特色小吃，配酒小食", "food", "A1", "Vamos de tapas por el barrio de La Latina.", "我们去拉蒂纳区吃小吃喝一杯吧。"],
  ["café con leche", "m.", "牛奶咖啡（西班牙早餐经典）", "food", "A1", "Un café con leche y una tostada, por favor.", "请给我来一杯牛奶咖啡和一份吐司。"],
  ["café cortado", "m.", "加少许热奶的浓缩咖啡（西式考拉多）", "food", "A1", "Prefiero un café cortado después de comer.", "午饭后我更喜欢喝一杯少奶浓缩。"],
  ["churros", "m.pl.", "西班牙吉事果，小油条", "food", "A1", "Desayunamos churros con chocolate caliente.", "我们早餐吃吉事果配热巧。"],
  ["jamón serrano", "m.", "西班牙塞拉诺火腿，高山风干火腿", "food", "A1", "Una ración de jamón serrano con pan y tomate.", "一份塞拉诺火腿配番茄面包擦面包。"],
  ["tortilla de patatas", "f.", "西班牙土豆煎蛋饼（国菜）", "food", "A1", "La tortilla de patatas con cebolla es deliciosa.", "带洋葱的西班牙土豆煎蛋饼太香了。"],
  ["paella valenciana", "f.", "瓦伦西亚传统海鲜肉菜饭", "food", "A1", "Los domingos preparamos paella valenciana en familia.", "周日我们全家一起做瓦伦西亚大锅饭。"],
  ["gazpacho", "m.", "安达卢西亚夏日番茄蔬菜冷汤", "food", "A2", "En verano el gazpacho bien frío es revitalizante.", "夏天喝上一碗冰镇番茄冷汤令人神清气爽。"],
  ["sangría", "f.", "西班牙水果红酒宾治饮品", "food", "A1", "Pedimos una jarra de sangría fresca con frutas.", "我们要了一扎冰镇新鲜水果红酒。"],
  ["siesta", "f.", "午休，午睡文化（地中海经典生活习惯）", "daily", "A1", "Dormir una breve siesta mejora la concentración.", "小睡一会儿午觉有助于提高专注力。"],
  ["sobremesa", "f.", "餐后围桌闲聊时光（西语特有温情词汇）", "daily", "A2", "La sobremesa de los domingos dura varias horas.", "周日吃完饭后的闲聊时光往往能持续好几个小时。"],
  ["terraza", "f.", "露天咖啡座，露台餐饮区", "food", "A1", "Nos sentamos en la terraza para tomar el sol.", "我们坐在露天座晒太阳喝咖啡。"],
  ["menú del día", "m.", "今日特惠午餐套餐（前菜+主菜+甜点）", "food", "A1", "El menú del día incluye primer plato y postre.", "今日特价套餐包含头盘和餐后甜点。"],
  ["pincho", "m.", "一口食小吃，竹签小食（北部特色）", "food", "A1", "En San Sebastián comimos unos pinchos exquisitos.", "在圣塞巴斯蒂安我们尝到了绝妙的签签小吃。"],
  ["aceite de oliva", "m.", "特级初榨橄榄油（地中海饮食灵魂）", "food", "A1", "España es el mayor productor de aceite de oliva.", "西班牙是全球最大的橄榄油生产国。"],
  ["panadería", "f.", "面包房，烘焙坊", "food", "A1", "Huele a pan recién horneado en la panadería.", "面包房里飘散着刚出炉面包的香气。"],
  ["frutería", "f.", "水果店，果蔬行", "food", "A1", "Compro naranjas frescas en la frutería de la esquina.", "我在转角的水果店买新鲜柑橘。"],
  ["supermercado", "m.", "超市，超级市场", "daily", "A1", "Hacemos la compra de la semana en el supermercado.", "我们在超市采购这一整周的生活用品。"],
  ["farmacia", "f.", "药店，大药房", "daily", "A1", "La farmacia de guardia abre las veinticuatro horas.", "这家值班药房二十四小时全天营业。"],

  // ========================================================
  // 3. 机场、交通与出行无忧 (Viajes, Transporte y Movilidad)
  // ========================================================
  ["tarjeta de embarque", "f.", "登机牌", "travel", "A1", "Descarga tu tarjeta de embarque en el móvil.", "把你的登机牌下载到手机里。"],
  ["equipaje de mano", "m.", "随身手提行李", "travel", "A1", "El equipaje de mano no debe superar los diez kilos.", "手提行李不可超过十公斤。"],
  ["control de seguridad", "m.", "安检通道，安全检查", "travel", "A1", "Pasa por el control de seguridad con calma.", "从容有序地通过安全检查通道。"],
  ["puerta de embarque", "f.", "登机口", "travel", "A1", "El vuelo a Madrid sale por la puerta B24.", "飞往马德里的航班在 B24 登机口登机。"],
  ["aduana", "f.", "海关检查站", "travel", "A2", "Debes declarar los artículos de valor en la aduana.", "贵重物品须在海关主动申报。"],
  ["billete de ida y vuelta", "m.", "往返车票，来回机票", "travel", "A1", "Comprar billete de ida y vuelta sale más barato.", "购买往返票比单程更划算。"],
  ["consigna", "f.", "行李寄存处，存包柜", "travel", "A2", "Dejamos las maletas en la consigna de la estación.", "我们把箱子存在火车站的行李寄存处。"],
  ["plano de metro", "m.", "地铁线路图", "travel", "A1", "Consulta el plano de metro para hacer el transbordo.", "查看地铁路线图以便确认换乘线路。"],
  ["retraso", "m.", "延误，晚点", "travel", "A2", "El tren lleva un retraso de quince minutos.", "列车晚点延误了十五分钟。"],
  ["parada de autobús", "f.", "公共汽车站台", "travel", "A1", "Te espero junto a la parada de autobús.", "我在公共汽车站牌旁边等你。"],
  ["salida de emergencia", "f.", "紧急安全出口", "travel", "A2", "Localiza la salida de emergencia más cercana.", "请留意离你最近的安全紧急出口。"],
  ["seguro de viaje", "m.", "旅行医疗保险", "travel", "B1", "Siempre contratamos un seguro de viaje para imprevistos.", "我们总会购买旅行意外险以防不测。"],
  ["objetos perdidos", "m.pl.", "失物招领处", "travel", "A2", "Recuperé mi cartera en la oficina de objetos perdidos.", "我在失物招领办公室找回了我的钱包。"],
  ["alojamiento", "m.", "住宿，下榻处", "travel", "A2", "Buscamos un alojamiento céntrico y económico.", "我们在寻找市中心且性价比高的住宿。"],
  ["reserva", "f.", "预定，预约席位", "travel", "A1", "Tengo una reserva a nombre de García.", "我有一份登记在加西亚名下的预订。"],

  // ========================================================
  // 4. 数字生活、科技与工作沟通 (Tecnología, Trabajo y Redes)
  // ========================================================
  ["conexión wifi", "f.", "无线网络连接，WiFi", "business", "A1", "¿Cuál es la contraseña de la conexión wifi?", "请问这里的无线网络密码是多少？"],
  ["contraseña", "f.", "密码，通行码", "business", "A1", "Introduce una contraseña segura con números y letras.", "请输入包含数字与字母的高强度安全密码。"],
  ["correo electrónico", "m.", "电子邮箱，电邮地址", "business", "A1", "Te envié el presupuesto por correo electrónico.", "我已经把预算方案通过电子邮件发给你了。"],
  ["página web", "f.", "网页，官方网站", "business", "A1", "Toda la información está disponible en la página web.", "所有详细资讯都可在官方网站查阅。"],
  ["descargar", "v.tr.", "下载（文件、应用等）", "business", "A2", "Puedes descargar la aplicación de forma gratuita.", "你可以完全免费下载这款应用程序。"],
  ["subir", "v.tr.", "上传；上升，提高", "business", "A2", "Acabo de subir las fotos del viaje a la nube.", "我刚刚把旅行拍摄的照片上传到了云端。"],
  ["enlace", "m.", "链接，超链接；结合", "business", "A2", "Haz clic en el enlace para confirmar tu registro.", "点击超链接以确认完成你的注册。"],
  ["archivo", "m.", "文件，档案；存档", "business", "A2", "Adjunto el archivo en formato PDF.", "我以 PDF 格式随信附上该文档。"],
  ["cargar la batería", "exp.", "给电池充电", "daily", "A2", "Necesito un enchufe para cargar la batería del móvil.", "我需要一个插座给手机充一下电。"],
  ["pantalla táctil", "f.", "触控屏，触摸屏幕", "business", "A2", "La tableta tiene una pantalla táctil muy sensible.", "这款平板电脑的触控屏幕非常灵敏。"],
  ["reunión virtual", "f.", "线上视频会议", "business", "B1", "Nos conectamos a la reunión virtual a las diez.", "我们上午十点准时接入线上视频会议。"],
  ["documento adjunto", "m.", "附件文档，随信附件", "business", "B1", "Revisa los detalles en el documento adjunto.", "请在随信附上的附件文档中查阅详情。"],
  ["inteligencia artificial", "f.", "人工智能（AI）", "business", "B1", "La inteligencia artificial transforma el aprendizaje de idiomas.", "人工智能正在深刻重塑语言学习方式。"],
  ["compartir pantalla", "exp.", "共享屏幕，投屏演示", "business", "B1", "¿Puedes compartir pantalla para mostrarnos la gráfica?", "你能共享一下屏幕为我们展示图表吗？"],
  ["reiniciar", "v.tr.", "重新启动（系统、手机、电脑）", "business", "A2", "Si el programa se bloquea, prueba a reiniciar.", "如果软件卡顿死机，试着重新启动设备。"],
  ["hacer clic", "exp.", "点击，按鼠标键", "business", "A1", "Haz clic en el botón verde para continuar.", "轻点绿色按钮以继续下一步。"],

  // ========================================================
  // 5. 情绪性格与积极心态 (Emociones, Virtudes y Relaciones)
  // ========================================================
  ["Ánimo", "interj.", "加油！振作起来！鼓起劲！", "emotion", "A1", "¡Ánimo, que ya queda muy poco para terminar!", "加油，马上就要大功告成了！"],
  ["paciencia", "f.", "耐心，耐性，从容", "emotion", "A2", "Aprender un idioma requiere paciencia y constancia.", "学好一门外语需要持久的耐心与坚持。"],
  ["amabilidad", "f.", "亲切，和蔼，友善态度", "emotion", "A2", "Agradezco mucho su amabilidad y hospitalidad.", "我非常感谢您的和蔼友好与热情款待。"],
  ["generosidad", "f.", "慷慨，大度，乐善好施", "emotion", "B1", "Su generosidad con los necesitados es admirable.", "他对困难人群的慷慨解囊令人肃然起敬。"],
  ["confianza", "f.", "信任，信心，底气", "emotion", "A2", "Tengo plena confianza en tus capacidades.", "我对你的实力与潜能充满信心。"],
  ["tranquilidad", "f.", "宁静，从容，平心静气", "emotion", "A2", "Pasear por el bosque me transmite mucha tranquilidad.", "漫步在林间带给我极大的内心宁静。"],
  ["orgullo", "m.", "自豪，自豪感；傲气", "emotion", "B1", "Siento un gran orgullo por los logros de mi equipo.", "我为团队取得的辉煌成绩深感自豪。"],
  ["agradecimiento", "m.", "感谢之情，感恩，谢意", "emotion", "B1", "Quiero expresar mi sincero agradecimiento a mis maestros.", "我想向恩师们表达我由衷的谢意。"],
  ["empatía", "f.", "共情力，同理心，换位思考", "emotion", "B1", "La empatía es fundamental para resolver malentendidos.", "同理心是化解各种人际误会的核心。"],
  ["entusiasmo", "m.", "热情，干劲，热忱", "emotion", "B1", "Comenzó el nuevo proyecto con desbordante entusiasmo.", "他带着满腔热情全身心投入到了新项目中。"],
  ["esperanza", "f.", "希望，期盼，希冀", "emotion", "A2", "La esperanza nos da fuerzas en momentos difíciles.", "希望赋予我们逆境中破浪前行的力量。"],
  ["sinceridad", "f.", "真诚，坦率，诚挚", "emotion", "B1", "Valoro mucho la sinceridad en una amistad duradera.", "在长久的情谊中我格外珍视彼此的坦诚。"],
  ["sentido del humor", "m.", "幽默感，风趣", "emotion", "A2", "Tiene un gran sentido del humor que alegra a todos.", "他拥有出色的幽默感，总能让周围人欢笑。"],
  ["solidaridad", "f.", "团结互助精神，扶危济困", "emotion", "B1", "La solidaridad ciudadana fue clave durante la nevada.", "市民们守望相助的精神在雪灾中发挥了关键作用。"],
  ["gratitud", "f.", "感恩，感激", "emotion", "B1", "Guardamos una profunda gratitud hacia quienes nos apoyaron.", "我们对所有给予支持的人怀有深深的感激。"]
];

export const OPEN_SPANISH_WORDS: SpanishWord[] = RAW_OPEN_WORDS.map((entry, idx) => {
  const [rawWord, partOfSpeech, meaning, category, level, exampleEs, exampleZh] = entry;
  // Clean punctuation from head and tail for typing and recitation compatibility
  const word = rawWord.replace(/^[¡¿"\s]+|[!?"\s]+$/g, "").trim();
  
  let categoryName = "实用西语";
  if (category === "food") categoryName = "西语美食文化";
  else if (category === "travel") categoryName = "交通出行无忧";
  else if (category === "business") categoryName = "数字办公生活";
  else if (category === "emotion") categoryName = "地道情感性格";
  else if (category === "daily") categoryName = "高频地道口语";

  return {
    id: `open-es-${String(idx + 1).padStart(4, "0")}`,
    word,
    partOfSpeech,
    meaning,
    category,
    categoryName,
    level,
    exampleEs,
    exampleZh,
  };
});
