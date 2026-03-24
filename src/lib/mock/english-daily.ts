import type { Question } from "@/types/quiz";

export const ENGLISH_DAILY_QUESTIONS: Question[] = [
  // ── 1. 글의 목적 (★☆) ──
  {
    id: "en-d-01",
    subject: "english",
    area: "읽기",
    subArea: "글의 목적",
    questionType: "글의 목적",
    difficulty: "easy",
    points: 2,
    passageText:
      "Dear Residents,\n\nWe are writing to inform you that the annual building maintenance will take place from March 15 to March 22. During this period, the water supply will be temporarily interrupted between 9 a.m. and 5 p.m. on weekdays. We recommend storing sufficient water in advance. Additionally, the elevator in Building A will undergo inspection on March 18 and will be unavailable for the entire day. We apologize for any inconvenience and appreciate your understanding. Please contact the management office if you have any questions.",
    questionText: "What is the purpose of this letter?",
    choices: [
      "To invite residents to a community event",
      "To notify residents of upcoming maintenance work",
      "To announce changes in building management",
      "To request feedback on building facilities",
      "To introduce new security measures",
    ],
    correctAnswer: 1,
    explanations: [
      "편지의 첫 문장 'We are writing to inform you that the annual building maintenance will take place'에서 건물 유지보수를 알리는 목적임을 명확히 밝히고 있습니다.",
      "이후 단수 중단, 엘리베이터 점검 등 구체적인 유지보수 일정을 안내하고 있어 '유지보수 공지'가 목적입니다.",
    ],
    recommendedTime: 60,
    conceptTags: ["글의 목적", "공지문"],
  },

  // ── 2. 심경 추론 (★☆) ──
  {
    id: "en-d-02",
    subject: "english",
    area: "읽기",
    subArea: "심경 추론",
    questionType: "심경 추론",
    difficulty: "easy",
    points: 2,
    passageText:
      "Sarah stood at the edge of the cliff, her heart pounding in her chest. Below, the vast ocean stretched endlessly, waves crashing against the rocks with a thunderous roar. She had trained for months for this moment — her first solo paragliding flight. As the instructor gave the final signal, her hands trembled slightly, but a surge of excitement pushed through the fear. She took a deep breath, spread her arms wide, and leaped into the open sky.",
    questionText:
      "How did Sarah most likely feel at the moment described above?",
    choices: [
      "Bored and indifferent",
      "Nervous but excited",
      "Calm and relaxed",
      "Angry and frustrated",
      "Sad and hopeless",
    ],
    correctAnswer: 1,
    explanations: [
      "'heart pounding', 'hands trembled'에서 긴장감이, 'a surge of excitement pushed through the fear'에서 흥분감이 동시에 드러납니다.",
      "두려움 속에서도 흥분이 밀려온다는 표현이 핵심입니다.",
    ],
    recommendedTime: 90,
    conceptTags: ["심경 추론", "감정 어휘"],
  },

  // ── 3. 주장 추론 (★☆) ──
  {
    id: "en-d-03",
    subject: "english",
    area: "읽기",
    subArea: "주장 추론",
    questionType: "주장 추론",
    difficulty: "easy",
    points: 2,
    passageText:
      "Many schools have eliminated recess in favor of more instructional time, believing that additional classroom hours will improve academic performance. However, research consistently shows that children who have regular breaks during the school day demonstrate better concentration, improved behavior, and higher test scores. Physical activity during recess also helps reduce childhood obesity and promotes social skills development. Rather than cutting recess, schools should recognize it as an essential component of a well-rounded education.",
    questionText: "다음 글에서 필자가 주장하는 바로 가장 적절한 것은?",
    choices: [
      "학교 수업 시간을 늘려야 한다.",
      "쉬는 시간을 없애고 학업에 집중해야 한다.",
      "학교는 쉬는 시간을 교육의 필수 요소로 인식해야 한다.",
      "체육 수업을 쉬는 시간으로 대체해야 한다.",
      "시험 성적 향상을 위해 방과 후 수업이 필요하다.",
    ],
    correctAnswer: 2,
    explanations: [
      "마지막 문장 'schools should recognize it as an essential component of a well-rounded education'이 필자의 주장을 직접적으로 나타냅니다.",
      "쉬는 시간(recess)의 학업적·신체적·사회적 이점을 근거로 제시하고 있습니다.",
    ],
    recommendedTime: 90,
    conceptTags: ["주장 추론", "한글 선지"],
  },

  // ── 4. 요지 추론 (★★) ──
  {
    id: "en-d-04",
    subject: "english",
    area: "읽기",
    subArea: "요지 추론",
    questionType: "요지 추론",
    difficulty: "medium",
    points: 2,
    passageText:
      "The widespread belief that multitasking increases productivity has been thoroughly debunked by cognitive science. When we attempt to do two complex tasks simultaneously, our brain doesn't actually process them in parallel. Instead, it rapidly switches between tasks, which consumes mental energy and increases error rates by up to 50 percent. Studies at Stanford University found that heavy multitaskers actually performed worse on cognitive tests than those who focused on single tasks. The illusion of efficiency masks a reality of diminished quality and increased stress.",
    questionText: "다음 글의 요지로 가장 적절한 것은?",
    choices: [
      "멀티태스킹은 생산성을 높이는 효과적인 방법이다.",
      "뇌는 여러 과제를 동시에 병렬 처리할 수 있다.",
      "멀티태스킹은 실제로 효율성을 떨어뜨리고 오류를 증가시킨다.",
      "스탠퍼드 대학의 연구는 신뢰할 수 없다.",
      "스트레스는 업무 능력 향상에 도움이 된다.",
    ],
    correctAnswer: 2,
    explanations: [
      "'The illusion of efficiency masks a reality of diminished quality and increased stress'라는 마지막 문장이 글의 요지를 함축합니다.",
      "멀티태스킹이 실제로는 효율적이지 않고 오류율을 높인다는 것이 핵심입니다.",
    ],
    recommendedTime: 100,
    conceptTags: ["요지 추론", "한글 선지"],
  },

  // ── 5. 내용 일치 (★☆) ──
  {
    id: "en-d-05",
    subject: "english",
    area: "읽기",
    subArea: "내용 일치",
    questionType: "내용 일치",
    difficulty: "easy",
    points: 2,
    passageText:
      "The International Space Station (ISS) orbits Earth at an altitude of approximately 408 kilometers, traveling at a speed of about 28,000 kilometers per hour. It completes one orbit every 90 minutes, meaning astronauts aboard witness 16 sunrises and sunsets each day. The station has been continuously occupied since November 2000, making it the longest-running human presence in space. Up to six crew members can live and work on the station at any given time, conducting scientific experiments in microgravity.",
    questionText:
      "According to the passage, which of the following is true about the ISS?",
    choices: [
      "It orbits at an altitude of 480 kilometers.",
      "Astronauts see 16 sunrises per day.",
      "It has been occupied since November 2010.",
      "Up to ten crew members can live on the station.",
      "It completes one orbit every 120 minutes.",
    ],
    correctAnswer: 1,
    explanations: [
      "'astronauts aboard witness 16 sunrises and sunsets each day'에서 하루 16번의 일출을 목격한다는 내용과 일치합니다.",
      "고도 408km(480 아님), 2000년(2010 아님), 6명(10명 아님), 90분(120분 아님)으로 다른 선지는 사실과 다릅니다.",
    ],
    recommendedTime: 90,
    conceptTags: ["내용 일치", "세부정보 파악"],
  },

  // ── 6. 어법 판단 (★★) ──
  {
    id: "en-d-06",
    subject: "english",
    area: "읽기",
    subArea: "어법 판단",
    questionType: "어법 판단",
    difficulty: "medium",
    points: 2,
    passageText:
      "The discovery of penicillin by Alexander Fleming in 1928 (A) [was / were] one of the most significant breakthroughs in medical history. Fleming noticed that a mold (B) [growing / grown] on a petri dish had killed the surrounding bacteria. This accidental observation led to the development of antibiotics, which (C) [has saved / have saved] millions of lives worldwide since then.",
    questionText:
      "Choose the grammatically correct option for each blank (A), (B), and (C).",
    choices: [
      "(A) was — (B) growing — (C) have saved",
      "(A) were — (B) growing — (C) has saved",
      "(A) was — (B) grown — (C) have saved",
      "(A) were — (B) grown — (C) has saved",
      "(A) was — (B) growing — (C) has saved",
    ],
    correctAnswer: 0,
    explanations: [
      "(A) 주어 'The discovery'가 단수이므로 'was'가 맞습니다.",
      "(B) 'a mold growing on a petri dish'에서 growing은 현재분사로 능동의 의미(자라고 있는 곰팡이)를 나타냅니다.",
      "(C) 선행사 'antibiotics'가 복수이므로 관계대명사절의 동사도 'have saved'가 맞습니다.",
    ],
    recommendedTime: 120,
    conceptTags: ["어법", "수일치", "분사"],
  },

  // ── 7. 주제/제목 (★★★) ──
  {
    id: "en-d-07",
    subject: "english",
    area: "읽기",
    subArea: "주제/제목",
    questionType: "주제/제목",
    difficulty: "hard",
    points: 3,
    passageText:
      "For decades, the prevailing model of expertise suggested that 10,000 hours of deliberate practice was the key to mastering any skill. However, recent research has complicated this picture considerably. Studies across diverse domains — from chess to surgery to music — reveal that practice accounts for only about 25 percent of performance differences. Factors such as working memory capacity, genetic predispositions, and the age at which training begins play equally crucial roles. Moreover, the quality of practice matters far more than its quantity; mindless repetition yields diminishing returns compared to focused, strategic engagement with challenging material.",
    questionText:
      "Which of the following is the best title for the passage?",
    choices: [
      "The Universal Power of 10,000 Hours",
      "Why Practice Makes Perfect in Every Field",
      "Beyond Practice: The Complex Nature of Expertise",
      "Genetic Determinism in Skill Development",
      "How Working Memory Guarantees Success",
    ],
    correctAnswer: 2,
    explanations: [
      "글은 10,000시간 법칙의 한계를 지적하며, 연습 외에 작업 기억, 유전적 소인, 연습의 질 등 다양한 요인이 전문성에 기여한다고 설명합니다.",
      "'Beyond Practice'는 연습을 넘어선 전문성의 복합적 본질을 잘 포착한 제목입니다.",
    ],
    recommendedTime: 120,
    conceptTags: ["주제", "제목 추론"],
  },

  // ── 8. 무관한 문장 (★★) ──
  {
    id: "en-d-08",
    subject: "english",
    area: "읽기",
    subArea: "무관한 문장",
    questionType: "무관한 문장",
    difficulty: "medium",
    points: 2,
    passageText:
      "Urban vertical farming is emerging as a promising solution to food security challenges. ① These indoor facilities use hydroponic systems to grow crops in stacked layers, requiring up to 95% less water than traditional farming. ② The global population is expected to reach 9.7 billion by 2050, placing unprecedented pressure on food production. ③ However, the initial construction costs of vertical farms can be prohibitively expensive, often exceeding $100 million for large-scale operations. ④ By eliminating the need for soil and reducing transportation distances, vertical farms can provide fresh produce year-round regardless of weather conditions. ⑤ This technology is particularly valuable in densely populated cities where arable land is scarce.",
    questionText:
      "Which sentence is least relevant to the main topic of the passage?",
    choices: ["①", "②", "③", "④", "⑤"],
    correctAnswer: 1,
    explanations: [
      "글의 주제는 '도시 수직 농업의 장점과 가능성'입니다.",
      "②번 문장은 세계 인구 증가에 대한 일반적 사실로, 수직 농업의 특성이나 장단점과 직접적인 관련이 없는 무관한 문장입니다.",
    ],
    recommendedTime: 100,
    conceptTags: ["무관한 문장", "글의 통일성"],
  },

  // ── 9. 요약 추론 (★★★) ──
  {
    id: "en-d-09",
    subject: "english",
    area: "읽기",
    subArea: "요약 추론",
    questionType: "요약 추론",
    difficulty: "hard",
    points: 3,
    passageText:
      "In a landmark study, psychologists divided participants into two groups before a challenging math test. One group was told that anxiety before a test is actually beneficial — it sharpens focus and improves performance. The other group received no such instruction. The results were striking: participants who reframed their anxiety as helpful scored 33% higher than the control group. This phenomenon, known as 'anxiety reappraisal,' suggests that our interpretation of physiological arousal — racing heart, sweaty palms — matters more than the arousal itself. When we label these sensations as excitement rather than fear, the same biological response fuels better performance.",
    questionText:
      "Which pair of words best completes the summary below?\n\nThe study shows that (A) ______ one's anxiety as a positive force can significantly (B) ______ test performance.",
    choices: [
      "(A) ignoring — (B) reduce",
      "(A) reinterpreting — (B) enhance",
      "(A) eliminating — (B) stabilize",
      "(A) suppressing — (B) weaken",
      "(A) accepting — (B) predict",
    ],
    correctAnswer: 1,
    explanations: [
      "'anxiety reappraisal(불안 재평가)'의 핵심은 불안을 '재해석(reinterpreting)'하는 것입니다.",
      "재해석한 그룹이 33% 높은 점수를 받았으므로 수행 능력을 '향상(enhance)'시킨다고 할 수 있습니다.",
    ],
    recommendedTime: 120,
    conceptTags: ["요약 추론", "빈칸 완성"],
  },

  // ── 10. 어휘 판단 (★★) ──
  {
    id: "en-d-10",
    subject: "english",
    area: "읽기",
    subArea: "어휘 판단",
    questionType: "어휘 판단",
    difficulty: "medium",
    points: 2,
    passageText:
      "The concept of 'planned obsolescence' refers to the deliberate design of products with a limited lifespan. Manufacturers intentionally make items that will become (A) [functional / dysfunctional] after a certain period, forcing consumers to purchase replacements. While this strategy boosts corporate profits, it generates enormous amounts of electronic waste. Critics argue that this practice is environmentally (B) [responsible / irresponsible] and call for regulations requiring companies to make more durable products.",
    questionText:
      "Which words are most appropriate for blanks (A) and (B)?",
    choices: [
      "(A) functional — (B) responsible",
      "(A) dysfunctional — (B) irresponsible",
      "(A) functional — (B) irresponsible",
      "(A) dysfunctional — (B) responsible",
      "(A) dysfunctional — (B) irrelevant",
    ],
    correctAnswer: 1,
    explanations: [
      "(A) 계획적 진부화(planned obsolescence)는 제품이 '기능을 잃게(dysfunctional)' 만드는 것입니다.",
      "(B) 비평가들은 이 관행이 환경적으로 '무책임하다(irresponsible)'고 주장합니다.",
    ],
    recommendedTime: 90,
    conceptTags: ["어휘 판단", "문맥 추론"],
  },

  // ── 11. 순서 배열 (★★★) ──
  {
    id: "en-d-11",
    subject: "english",
    area: "읽기",
    subArea: "순서 배열",
    questionType: "순서 배열",
    difficulty: "hard",
    points: 3,
    passageText:
      "The development of writing systems transformed human civilization in profound ways.\n\n(A) This shift from oral to written communication allowed knowledge to be preserved across generations, reducing dependence on individual memory.\n\n(B) Before writing, all information had to be memorized and passed down through spoken language, which inevitably led to distortion and loss of knowledge over time.\n\n(C) Furthermore, writing enabled the creation of legal codes, trade records, and scientific texts, laying the foundation for complex societies and institutions.",
    questionText:
      "What is the correct order of paragraphs following the first sentence?",
    choices: [
      "(A) → (B) → (C)",
      "(B) → (A) → (C)",
      "(C) → (A) → (B)",
      "(B) → (C) → (A)",
      "(A) → (C) → (B)",
    ],
    correctAnswer: 1,
    explanations: [
      "(B)는 문자 이전 상황을 설명하여 도입부 역할을 합니다.",
      "(A)는 'This shift'로 (B)의 구술→문자 전환을 받으며, (C)는 'Furthermore'로 추가 효과를 서술합니다.",
    ],
    recommendedTime: 120,
    conceptTags: ["순서 배열", "담화 연결어"],
  },

  // ── 12. 문장 삽입 (★★★★) ──
  {
    id: "en-d-12",
    subject: "english",
    area: "읽기",
    subArea: "문장 삽입",
    questionType: "문장 삽입",
    difficulty: "hard",
    points: 3,
    passageText:
      "Sleep plays a critical role in memory consolidation. ( ① ) During deep sleep, the brain replays experiences from the day, strengthening neural connections associated with important information. ( ② ) This process helps transfer short-term memories into long-term storage. ( ③ ) Students who slept for eight hours after studying retained 40% more information than those who stayed awake. ( ④ ) Consequently, sacrificing sleep to cram before exams may actually be counterproductive. ( ⑤ )",
    questionText:
      "Where does the following sentence best fit?\n\n\"A study at Harvard Medical School demonstrated this effect clearly.\"",
    choices: ["①", "②", "③", "④", "⑤"],
    correctAnswer: 2,
    explanations: [
      "삽입 문장은 '하버드 의대 연구가 이 효과를 명확히 보여주었다'는 내용입니다.",
      "③번 위치 뒤에 구체적인 실험 결과(8시간 수면 학생이 40% 더 기억)가 나오므로, 연구 소개 문장은 ③에 들어가는 것이 자연스럽습니다.",
    ],
    recommendedTime: 120,
    conceptTags: ["문장 삽입", "담화 흐름"],
  },

  // ── 13. 빈칸 추론 — 단어/구 (★★★★) ──
  {
    id: "en-d-13",
    subject: "english",
    area: "읽기",
    subArea: "빈칸 추론",
    questionType: "빈칸 추론 (단어/구)",
    difficulty: "hard",
    points: 3,
    passageText:
      "Creative breakthroughs rarely emerge from prolonged, focused concentration alone. Research in neuroscience reveals that the brain's 'default mode network' — activated during daydreaming, showering, or walking — plays a vital role in generating novel ideas. When we step away from a problem and allow our minds to wander, unconscious mental processes continue to work on the challenge, often producing unexpected connections between seemingly unrelated concepts. This is why many great inventions and artistic works have emerged not from the desk, but from moments of apparent ___________.",
    questionText:
      "Which word best fills the blank?",
    choices: [
      "concentration",
      "anxiety",
      "idleness",
      "competition",
      "discipline",
    ],
    correctAnswer: 2,
    explanations: [
      "글은 집중 작업이 아닌 산책, 샤워, 몽상 등 '비활동적' 순간에 창의적 돌파구가 나타난다고 설명합니다.",
      "'apparent idleness(겉보기에 아무것도 하지 않는 상태)'가 이 맥락에 가장 적합합니다.",
    ],
    recommendedTime: 150,
    conceptTags: ["빈칸 추론", "어휘"],
  },

  // ── 14. 빈칸 추론 — 절 (★★★★★ 킬러) ──
  {
    id: "en-d-14",
    subject: "english",
    area: "읽기",
    subArea: "빈칸 추론",
    questionType: "빈칸 추론 (절)",
    difficulty: "killer",
    points: 3,
    passageText:
      "One of the most counterintuitive findings in behavioral economics is the 'paradox of choice.' While conventional wisdom assumes that more options lead to greater satisfaction, extensive research by psychologist Barry Schwartz suggests otherwise. When consumers face an overwhelming number of alternatives, they experience decision paralysis, heightened anxiety, and ultimately less satisfaction with their final selection. This occurs because having numerous options raises expectations — people assume that with so many choices, they should be able to find the perfect one. When the chosen option inevitably falls short of perfection, disappointment follows. In essence, _______________________________________.",
    questionText:
      "Which of the following best completes the passage?",
    choices: [
      "more choices empower consumers to make better decisions",
      "limiting options is the only way to achieve customer loyalty",
      "the freedom to choose can paradoxically become a burden that diminishes well-being",
      "behavioral economics has failed to explain modern consumer behavior",
      "expectations play no role in determining consumer satisfaction",
    ],
    correctAnswer: 2,
    explanations: [
      "글 전체가 '선택의 역설'을 설명하며, 선택지가 많을수록 오히려 만족도가 떨어진다는 논지입니다.",
      "'선택의 자유가 역설적으로 안녕감(well-being)을 감소시키는 부담이 된다'는 문장이 글의 결론으로 가장 적합합니다.",
    ],
    recommendedTime: 180,
    conceptTags: ["빈칸 추론", "절", "킬러"],
  },
];
