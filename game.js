// ============================================
// 냇 킹 콜 같은 거야 - 도트 게임
// ============================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const dialogueBox = document.getElementById('dialogue-box');
const speakerEl = document.getElementById('speaker');
const dialogueTextEl = document.getElementById('dialogue-text');
const clickPrompt = document.getElementById('click-prompt');
const container = document.getElementById('game-container');

// 캔버스 해상도 (픽셀 아트용 저해상도)
const WIDTH = 128;
const HEIGHT = 128;
canvas.width = WIDTH;
canvas.height = HEIGHT;

// 게임 상태
let currentScene = 'title';
let dialogueIndex = 0;
let isTyping = false;
let canProgress = false;
let typewriterTimeout = null;
let snowflakes = [];
let time = 0;

// 캐릭터 상태
let charA = { x: 25, targetX: 25, frame: 0, state: 'idle' };
let charB = { x: 45, targetX: 45, frame: 0, state: 'idle' };
let speaker = { x: WIDTH/2 - 4, state: 'idle', opacity: 0.15 };
let childrenOpacity = 1;
let showScarf = false;
let snowIntensity = 1;
let charsOpacity = 1;
let faceY = 0;
let eyeState = 'open';
let screenShake = 0;

// ============================================
// 대사 데이터 (원작 기반)
// ============================================
const dialogues = {
  scene1: [
    { speaker: 'A', text: '해보자는거야?' },
    { speaker: 'B', text: '너가 먼저 시작했잖아.' },
    { speaker: 'A', text: '알았어, 그럼 저건 뭘까?', action: 'A_point' },
    { speaker: '', text: '(손으로 무언가를 가리킨다)' },
    { speaker: 'B', text: '저 눈사람?' },
    { speaker: 'A', text: '응, 눈사람.' },
    { speaker: 'B', text: '저건.. 챗 베이커 같은 거일거야.' },
    { speaker: 'A', text: '왜?' },
    { speaker: 'B', text: '왠지 불쌍해 보이잖아.' },
    { speaker: '', text: '(둘이 함께 웃는다)', action: 'both_laugh' },
    { speaker: '', text: '(목도리를 눈사람에게 둘러준다)', action: 'A_to_snowman' },
    { speaker: 'A', text: '우리 둘 중 누가 이걸 둘러준건지 이걸 보는 사람은 알까?', action: 'show_scarf' },
    { speaker: 'B', text: '글쎄, 아마 모르지 않을까? 알고 싶어하지도 않을 거야.', action: 'B_to_snowman' },
    { speaker: 'A', text: '넌 그게 문제야.' },
    { speaker: 'B', text: '어째서?' },
    { speaker: 'A', text: '잘 생각해봐, 사실은 우리가 둘러준 게 아닐 수도 있어.' },
    { speaker: 'B', text: '진심이야?' },
    { speaker: 'A', text: '물론이지, 저 차가운 챗 베이커처럼 우리도 곧 죽어버릴거라고.' },
    { speaker: 'B', text: '그렇네, 그러면 저 목도리는 뭐야?' },
    { speaker: '', text: '(씨익 웃으며)' },
    { speaker: 'A', text: '글쎄.. 그건 아마..', action: 'fade_chars' },
  ],

  scene2: [
    { speaker: '', text: '(물에 잠긴 얼굴. 두 눈을 부릅뜨고 있다.)' },
    { speaker: '여자', text: '너무 늦었다.', action: 'blink' },
    { speaker: '여자', text: '나는 가야 한다.' },
    { speaker: '여자', text: '그곳으로 가고 싶다.' },
    { speaker: '여자', text: '무언가를 갈망한다는 건 얼마나 아름다운 일인가.', action: 'sink' },
    { speaker: '여자', text: '내 삶의 유일한 아름다움, 그것은 바로..' },
    { speaker: '', text: '...' },
  ],

  scene3: [
    { speaker: '', text: '(어둠 속. 두 아이의 실루엣이 뛰어다닌다.)' },
    { speaker: '', text: '(비명에 가까운 웃음소리)' },
    { speaker: '', text: '...', action: 'children_fade' },
    { speaker: '화자', text: '저는 아이들의 무릎을 보는 걸 좋아했어요.', action: 'speaker_appear' },
    { speaker: '화자', text: '온갖 것들이 묻어있는 무릎, 까진 무릎, 깨끗한 무릎,' },
    { speaker: '화자', text: '그건 마치 일기장을 훔쳐보는 것과 같은 일이거든요.' },
    { speaker: '', text: '(한쪽 무릎을 굽힌다)', action: 'kneel' },
    { speaker: '화자', text: '몸을 굽힌다는 게 여러분들에게는 어떤 의미인가요?' },
    { speaker: '화자', text: '제게는 생각보다 많은 의미가 있어요,' },
    { speaker: '화자', text: '제겐 손을 내밀고 시선을 주는 것과 같죠.', action: 'reach' },
    { speaker: '화자', text: '하지만 전 이제는 손을 내밀지 않습니다.', action: 'stand' },
    { speaker: '화자', text: '다른 손을 내밀기는 하지만요.' },
    { speaker: '화자', text: '언젠가부터 제 무릎은 늘 깨끗했습니다.' },
    { speaker: '화자', text: '제 무릎을 살피는 사람 또한 없었죠.' },
    { speaker: '화자', text: '그래서일까요? 저는 무릎을 보는 걸 좋아합니다.' },
    { speaker: '화자', text: '설령 피떡이 된 무릎이라도요.' },
    { speaker: '', text: '(엄지와 검지를 모아 바르는 시늉)', action: 'rub' },
    { speaker: '화자', text: '그럴땐 이렇게 약을 발라줘야해요, 살살살살,' },
    { speaker: '화자', text: '세게 하면 안됩니다, 무릎이 소리를 지르거든요.' },
    { speaker: '화자', text: '약을 성공적으로 발라준다면 갑작스러운 맞닿음에 놀라서 부르르 떨곤 하는데..' },
    { speaker: '', text: '(미소 짓는다)', action: 'stand' },
    { speaker: '화자', text: '그 순간이 바로 제가 제일 좋아하는 순간이랍니다.' },
    { speaker: '', text: '...' },
    { speaker: '화자', text: '다시금 말씀 드리지만 제게는 그것을 바라보는 것이 손을 내미는 행위와 같답니다,' },
    { speaker: '화자', text: '비록 상호작용은 없지만요.' },
    { speaker: '화자', text: '가끔은 그 사실에 너무 화가나서 그것을 붙잡고 늘어져서 엉엉 울고싶기도 해요.' },
    { speaker: '', text: '(날카롭게)', action: 'aggressive' },
    { speaker: '화자', text: '아니면 부숴버리거나.' },
    { speaker: '화자', text: '너무 놀라진 마세요!', action: 'stand' },
    { speaker: '화자', text: '여러분들이 모두 아시다시피 무릎을 부순다는 건 생각보다 별 일이 아니랍니다.' },
    { speaker: '화자', text: '부숴진 건 그 아이의 뼈겠지만 다시 붙힐 수 없는 건 저의 자아 아니겠어요?' },
    { speaker: '화자', text: '불쌍한 나의 자아,' },
    { speaker: '화자', text: '무릎을 부여 잡고 비명을 지르는 아이가 얼마나 부러울까요?' },
    { speaker: '화자', text: '저를 쳐다보는 눈이 달라지셨네요.' },
    { speaker: '화자', text: '여러분의 시선이 저는 짜릿하답니다!' },
    { speaker: '화자', text: '다들 제게 악수를 청하고 계시는거죠?', action: 'wave' },
    { speaker: '', text: '(허공에 악수하며)' },
    { speaker: '화자', text: '반갑습니다, 안녕하세요? 좋은 저녁이에요,', action: 'pace' },
    { speaker: '화자', text: '지금이 저녁인가?' },
    { speaker: '화자', text: '너무 신경쓰지마세요.' },
    { speaker: '화자', text: '여러분들이 오늘 뭔가를 보고, 듣고, 겪고, 역겹고, 구역감이 들고..' },
    { speaker: '화자', text: '그 어떤 특별한 느낌이 당신을 뒤흔들어 버릴지라도' },
    { speaker: '화자', text: '내일이면 전부 까맣게 잊어버릴테니까요.' },
    { speaker: '화자', text: '내일이 뭐야? 아마 여기서 벗어난다면 10분이면 충분할 거예요.' },
    { speaker: '화자', text: '제가 이 자리에서 죽어버리지 않는 한..', action: 'stand' },
    { speaker: '', text: '...' },
    { speaker: '', text: '(귀가 찢어질듯 한 비명)', action: 'scream' },
    { speaker: '화자', text: '움직이지마! 움직이면 목을 뜯어버릴거야!' },
    { speaker: '', text: '(자신의 목을 움켜쥔다)', action: 'grab_throat' },
    { speaker: '', text: '...' },
    { speaker: '화자', text: '놀라셨나요? 죄송합니다.', action: 'stand' },
    { speaker: '', text: '...' },
    { speaker: '화자', text: '그러니까 여기 있어주시겠어요?' },
    { speaker: '화자', text: '당신은 지금 제 이야기를 듣기위해 이곳에 있잖아요?' },
    { speaker: '화자', text: '아니라고요? 아니면 뭐 어쩔건데?' },
    { speaker: '화자', text: '농담이에요.' },
    { speaker: '화자', text: '저는 우울한 인간이에요. 저는 요즘 상태가 좋지 않아요.' },
    { speaker: '화자', text: '당신은 지금까지 그래왔듯 그저 거기에 앉아있기만 하면 돼요.' },
    { speaker: '', text: '...' },
  ],

  scene3b: [
    { speaker: '', text: '(공간이 바뀐다)' },
    { speaker: '화자', text: '저는 아픈 인간입니다, 부족한 인간입니다.' },
    { speaker: '화자', text: '제겐 두 아이가 있습니다.' },
    { speaker: '화자', text: '있었습니다.', action: 'look_down' },
    { speaker: '화자', text: '최근에 전 그들을 사랑하는 것을 그만뒀습니다.' },
    { speaker: '화자', text: '어떻게 그럴 수가 있냐고요?' },
    { speaker: '화자', text: '모든 것은 선택할 수 있는걸요.' },
    { speaker: '', text: '...' },
    { speaker: '화자', text: '그들 중 하나가 더 이상 숨을 쉬지 않았을 때 저는 울었습니다.', action: 'tremble' },
    { speaker: '화자', text: '그리고 두려웠습니다.' },
    { speaker: '화자', text: '그것이 사랑이었습니까?' },
    { speaker: '', text: '...' },
    { speaker: '화자', text: '아무래도 전 망가진 것 같습니다.', action: 'stand' },
    { speaker: '화자', text: '아무래도 전 아픈 것 같습니다.' },
    { speaker: '화자', text: '아무래도 전 이상한 것 같습니다.' },
    { speaker: '화자', text: '아무래도 전 비가 오는 날 걸어야 할 것 같습니다.', action: 'walk_away' },
    { speaker: '', text: '...' },
  ],

  ending: [
    { speaker: '', text: '글쎄.. 그건 아마..' },
    { speaker: '', text: '...' },
    { speaker: '', text: '냇 킹 콜 같은 거일거야.' },
    { speaker: '', text: '...' },
    { speaker: '', text: '오늘 밤은 오랜만에 음악을 들어야겠어요,' },
    { speaker: '', text: '옛 친구가 제게 가끔 들려줬던 음악을,' },
    { speaker: '', text: '나만이 가지고있는 그 소리를..' },
    { speaker: '', text: '...' },
    { speaker: '', text: '- 끝 -' },
  ]
};

// ============================================
// 렌더링 함수들
// ============================================

function initSnow(count = 50) {
  snowflakes = [];
  for (let i = 0; i < count; i++) {
    snowflakes.push({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      speed: 0.2 + Math.random() * 0.3,
      drift: Math.random() * 0.5 - 0.25
    });
  }
}

function updateAndDrawSnow() {
  ctx.fillStyle = '#fff';
  for (let flake of snowflakes) {
    flake.y += flake.speed * snowIntensity;
    flake.x += (flake.drift + Math.sin(time * 0.02 + flake.x) * 0.1) * snowIntensity;

    if (flake.y > HEIGHT) {
      flake.y = -2;
      flake.x = Math.random() * WIDTH;
    }
    if (flake.x < 0) flake.x = WIDTH;
    if (flake.x > WIDTH) flake.x = 0;

    ctx.fillRect(Math.floor(flake.x), Math.floor(flake.y), 1, 1);
  }
}

// 캐릭터 실루엣 (다양한 상태 지원)
function drawCharacter(x, y, state = 'idle', opacity = 1) {
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;

  // 숨쉬기 애니메이션
  const breathe = Math.sin(time * 0.1) * 0.5;

  // 상태별 오프셋
  let bobY = 0;
  let armState = 'down';
  let legState = 'stand';
  let shakeX = 0;

  switch(state) {
    case 'idle':
      bobY = breathe;
      break;
    case 'shiver':
      shakeX = Math.sin(time * 0.8) * 1;
      break;
    case 'laugh':
      bobY = Math.abs(Math.sin(time * 0.5)) * 2;
      break;
    case 'point':
      armState = 'point';
      break;
    case 'walk':
      legState = 'walk';
      bobY = Math.sin(time * 0.3) * 1;
      break;
  }

  const bx = Math.floor(x + shakeX);
  const by = Math.floor(y + bobY);

  // 머리
  const head = [[2,0],[3,0],[4,0],[5,0],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[2,3],[3,3],[4,3],[5,3]];

  // 목
  const neck = [[3,4],[4,4]];

  // 몸통
  const body = [[2,5],[3,5],[4,5],[5,5],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[2,8],[3,8],[4,8],[5,8],[2,9],[3,9],[4,9],[5,9],[2,10],[3,10],[4,10],[5,10]];

  // 팔
  let arms;
  if (armState === 'point') {
    arms = [[7,5],[8,4],[9,3],[0,6],[-1,7]]; // 오른팔 올림
  } else {
    const armSwing = Math.sin(time * 0.15) * 0.5;
    arms = [[0,6+armSwing],[-1,7+armSwing],[7,6-armSwing],[8,7-armSwing]];
  }

  // 다리
  let legs;
  if (legState === 'walk') {
    const legFrame = Math.floor(time / 5) % 4;
    if (legFrame % 2 === 0) {
      legs = [[2,11],[3,11],[4,11],[5,11],[1,12],[2,12],[5,12],[6,12],[0,13],[1,13],[6,13],[7,13],[0,14],[1,14],[6,14],[7,14],[-1,15],[0,15],[7,15],[8,15]];
    } else {
      legs = [[2,11],[3,11],[4,11],[5,11],[2,12],[3,12],[4,12],[5,12],[2,13],[3,13],[4,13],[5,13],[1,14],[2,14],[5,14],[6,14],[0,15],[1,15],[6,15],[7,15]];
    }
  } else {
    legs = [[2,11],[3,11],[4,11],[5,11],[2,12],[3,12],[4,12],[5,12],[1,13],[2,13],[5,13],[6,13],[1,14],[2,14],[5,14],[6,14],[0,15],[1,15],[2,15],[5,15],[6,15],[7,15]];
  }

  const all = [...head, ...neck, ...body, ...arms, ...legs];
  for (let [px, py] of all) {
    ctx.fillRect(bx + Math.floor(px), by + Math.floor(py), 1, 1);
  }
}

// 화자 캐릭터 (Scene 3)
function drawSpeaker(x, y, state = 'idle', opacity = 0.15) {
  ctx.fillStyle = `rgba(255,255,255,${opacity})`;

  const breathe = Math.sin(time * 0.08) * 0.3;
  let bobY = breathe;
  let shakeX = 0;
  let armState = 'down';
  let kneeling = false;

  switch(state) {
    case 'kneel':
      kneeling = true;
      break;
    case 'reach':
      armState = 'reach';
      break;
    case 'wave':
      armState = 'wave';
      break;
    case 'aggressive':
      armState = 'aggressive';
      shakeX = Math.sin(time * 0.5) * 2;
      break;
    case 'grab_throat':
      armState = 'throat';
      break;
    case 'tremble':
      shakeX = Math.sin(time * 0.8) * 1.5;
      break;
    case 'rub':
      armState = 'rub';
      break;
    case 'pace':
      x += Math.sin(time * 0.05) * 20;
      bobY += Math.sin(time * 0.2) * 0.5;
      break;
    case 'look_down':
      bobY += 2;
      break;
    case 'walk_away':
      x += time * 0.3;
      bobY += Math.sin(time * 0.2) * 0.5;
      break;
  }

  const bx = Math.floor(x + shakeX);
  const by = Math.floor(y + bobY);

  // 머리
  const head = [[2,0],[3,0],[4,0],[5,0],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[2,3],[3,3],[4,3],[5,3]];
  const neck = [[3,4],[4,4]];
  const body = [[2,5],[3,5],[4,5],[5,5],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[2,8],[3,8],[4,8],[5,8],[2,9],[3,9],[4,9],[5,9],[2,10],[3,10],[4,10],[5,10]];

  // 팔 상태별
  let arms;
  switch(armState) {
    case 'reach':
      arms = [[7,5],[8,4],[9,4],[10,4],[0,6],[-1,7]];
      break;
    case 'wave':
      const waveY = Math.sin(time * 0.3) > 0 ? 0 : 1;
      arms = [[7,4+waveY],[8,3+waveY],[9,2+waveY],[0,6],[-1,7]];
      break;
    case 'aggressive':
      arms = [[7,4],[8,3],[9,2],[-1,4],[-2,3]];
      break;
    case 'throat':
      arms = [[5,3],[6,3],[7,3],[1,3],[0,3],[-1,3]];
      break;
    case 'rub':
      const rubY = Math.sin(time * 0.2) * 2;
      arms = [[7,6+rubY],[8,7+rubY],[0,6],[-1,7]];
      break;
    default:
      const armSwing = Math.sin(time * 0.1) * 0.3;
      arms = [[0,6+armSwing],[-1,7+armSwing],[7,6-armSwing],[8,7-armSwing]];
  }

  // 다리 (무릎 꿇기)
  let legs;
  if (kneeling) {
    legs = [[2,11],[3,11],[4,11],[5,11],[3,12],[4,12],[5,12],[6,12],[4,13],[5,13],[6,13],[7,13]];
  } else {
    legs = [[2,11],[3,11],[4,11],[5,11],[2,12],[3,12],[4,12],[5,12],[1,13],[2,13],[5,13],[6,13],[1,14],[2,14],[5,14],[6,14],[0,15],[1,15],[2,15],[5,15],[6,15],[7,15]];
  }

  const all = [...head, ...neck, ...body, ...arms, ...legs];
  for (let [px, py] of all) {
    ctx.fillRect(bx + Math.floor(px), by + Math.floor(py), 1, 1);
  }
}

// 아이 실루엣
function drawChild(x, y, frame, opacity = 1) {
  ctx.fillStyle = `rgba(255,255,255,${opacity * 0.3})`;
  const bobY = Math.sin(frame * 0.3) * 2;
  const legFrame = Math.floor(frame / 3) % 2;

  const head = [[1,0],[2,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2]];
  const body = [[1,3],[2,3],[3,3],[0,4],[1,4],[2,4],[3,4],[4,4],[1,5],[2,5],[3,5],[1,6],[2,6],[3,6]];

  let legs;
  if (legFrame === 0) {
    legs = [[0,7],[1,7],[3,7],[4,7],[0,8],[4,8]];
  } else {
    legs = [[1,7],[2,7],[3,7],[1,8],[3,8]];
  }

  const all = [...head, ...body, ...legs];
  for (let [px, py] of all) {
    ctx.fillRect(Math.floor(x + px), Math.floor(y + py + bobY), 1, 1);
  }
}

function drawSnowman(x, y) {
  ctx.fillStyle = '#fff';
  for (let i = -4; i <= 4; i++) {
    for (let j = -4; j <= 4; j++) {
      if (i*i + j*j <= 16) ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      if (i*i + j*j <= 9) ctx.fillRect(x + i, y - 7 + j, 1, 1);
    }
  }
  ctx.fillStyle = '#000';
  ctx.fillRect(x - 1, y - 8, 1, 1);
  ctx.fillRect(x + 1, y - 8, 1, 1);
}

function drawScarf(x, y) {
  ctx.fillStyle = '#888';
  ctx.fillRect(x - 3, y - 4, 7, 2);
  ctx.fillRect(x + 2, y - 4, 2, 5);
}

function drawSubmergedFace(yOffset = 0) {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2 + yOffset;

  ctx.fillStyle = '#fff';
  for (let i = -15; i <= 15; i++) {
    for (let j = -20; j <= 20; j++) {
      if ((i*i)/(15*15) + (j*j)/(20*20) <= 1) {
        const wave = Math.sin(time * 0.05 + j * 0.1) * 2;
        ctx.fillRect(cx + i + wave, cy + j, 1, 1);
      }
    }
  }

  ctx.fillStyle = '#000';
  if (eyeState === 'open') {
    for (let i = -2; i <= 2; i++) {
      for (let j = -1; j <= 1; j++) {
        ctx.fillRect(cx - 6 + i, cy - 5 + j, 1, 1);
        ctx.fillRect(cx + 6 + i, cy - 5 + j, 1, 1);
      }
    }
  } else {
    ctx.fillRect(cx - 8, cy - 5, 5, 1);
    ctx.fillRect(cx + 4, cy - 5, 5, 1);
  }

  // 물결
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  for (let i = 0; i < WIDTH; i += 4) {
    const waveY = Math.sin(time * 0.03 + i * 0.1) * 3;
    ctx.fillRect(i, cy + 25 + waveY, 2, 1);
  }
}

// ============================================
// 액션 처리
// ============================================
function handleAction(action) {
  if (!action) return;

  switch(action) {
    // Scene 1 액션
    case 'B_shiver':
      charB.state = 'shiver';
      break;
    case 'close_together':
      charA.targetX = 35;
      charB.targetX = 40;
      charA.state = 'idle';
      charB.state = 'idle';
      break;
    case 'A_point':
      charA.state = 'point';
      break;
    case 'B_look':
      charB.state = 'idle';
      break;
    case 'both_laugh':
      charA.state = 'laugh';
      charB.state = 'laugh';
      break;
    case 'A_to_snowman':
      charA.targetX = 80;
      charA.state = 'walk';
      break;
    case 'show_scarf':
      showScarf = true;
      charA.state = 'idle';
      break;
    case 'B_to_snowman':
      charB.targetX = 75;
      charB.state = 'walk';
      break;
    case 'B_step_back':
      charB.targetX = 70;
      charB.state = 'idle';
      break;
    case 'wind':
      snowIntensity = 1.5;
      break;
    case 'heavy_snow':
      snowIntensity = 2.5;
      break;
    case 'fade_chars':
      charsOpacity = 0;
      break;

    // Scene 2 액션
    case 'blink':
      eyeState = eyeState === 'open' ? 'closed' : 'open';
      break;
    case 'sink':
      // faceY는 업데이트에서 처리
      break;

    // Scene 3 액션
    case 'children_fade':
      childrenOpacity = 0;
      break;
    case 'speaker_appear':
      speaker.opacity = 0.6;
      speaker.state = 'idle';
      break;
    case 'kneel':
      speaker.state = 'kneel';
      break;
    case 'reach':
      speaker.state = 'reach';
      break;
    case 'stand':
      speaker.state = 'idle';
      break;
    case 'rub':
      speaker.state = 'rub';
      break;
    case 'wave':
      speaker.state = 'wave';
      break;
    case 'aggressive':
      speaker.state = 'aggressive';
      break;
    case 'scream':
      speaker.state = 'aggressive';
      screenShake = 20;
      break;
    case 'grab_throat':
      speaker.state = 'grab_throat';
      break;
    case 'pace':
      speaker.state = 'pace';
      break;
    case 'look_down':
      speaker.state = 'look_down';
      break;
    case 'tremble':
      speaker.state = 'tremble';
      break;
    case 'walk_away':
      speaker.state = 'walk_away';
      break;
  }
}

// ============================================
// 업데이트
// ============================================
function update() {
  // 캐릭터 이동
  if (charA.x !== charA.targetX) {
    const diff = charA.targetX - charA.x;
    charA.x += Math.sign(diff) * Math.min(Math.abs(diff), 0.5);
    if (Math.abs(diff) < 0.5) {
      charA.x = charA.targetX;
      if (charA.state === 'walk') charA.state = 'idle';
    }
  }
  if (charB.x !== charB.targetX) {
    const diff = charB.targetX - charB.x;
    charB.x += Math.sign(diff) * Math.min(Math.abs(diff), 0.5);
    if (Math.abs(diff) < 0.5) {
      charB.x = charB.targetX;
      if (charB.state === 'walk') charB.state = 'idle';
    }
  }

  // Scene 2 가라앉기
  if (currentScene === 'scene2' && dialogueIndex >= 5) {
    faceY += 0.2;
  }

  // 화면 흔들림 감소
  if (screenShake > 0) screenShake -= 0.5;

  // 캐릭터 페이드
  if (charsOpacity > 0 && dialogues.scene1[dialogueIndex-1]?.action === 'fade_chars') {
    charsOpacity -= 0.02;
  }
}

// ============================================
// 씬 렌더링
// ============================================

function renderScene1() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  updateAndDrawSnow();

  ctx.fillStyle = '#333';
  ctx.fillRect(0, HEIGHT - 10, WIDTH, 1);

  drawSnowman(100, HEIGHT - 15);
  if (showScarf) drawScarf(100, HEIGHT - 15);

  if (charsOpacity > 0) {
    drawCharacter(charA.x, HEIGHT - 26, charA.state, charsOpacity);
    drawCharacter(charB.x, HEIGHT - 26, charB.state, charsOpacity);
  }
}

function renderScene2() {
  ctx.fillStyle = '#000508';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawSubmergedFace(faceY);

  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  for (let i = 0; i < 10; i++) {
    const bx = (time * 0.5 + i * 30) % WIDTH;
    const by = HEIGHT - 20 + Math.sin(time * 0.02 + i) * 5;
    ctx.fillRect(bx, by, 2, 2);
  }
}

function renderScene3() {
  ctx.fillStyle = '#000';

  // 화면 흔들림
  if (screenShake > 0) {
    ctx.save();
    ctx.translate(Math.sin(time * 2) * screenShake * 0.1, Math.cos(time * 2.5) * screenShake * 0.1);
  }

  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 아이들
  if (childrenOpacity > 0) {
    const offset1 = Math.sin(time * 0.12) * 25;
    const offset2 = Math.cos(time * 0.12) * 25;
    drawChild(30 + offset1, HEIGHT/2 - 5, time, childrenOpacity);
    drawChild(80 + offset2, HEIGHT/2 - 5, time + 50, childrenOpacity);
  }

  // 화자
  if (speaker.opacity > 0) {
    drawSpeaker(speaker.x, HEIGHT/2 - 8, speaker.state, speaker.opacity);
  }

  if (screenShake > 0) {
    ctx.restore();
  }
}

function renderEnding() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// ============================================
// 대사 시스템
// ============================================

function showDialogue(speakerName, text, action, callback) {
  dialogueBox.classList.add('visible');
  clickPrompt.classList.remove('visible');
  speakerEl.textContent = speakerName;
  dialogueTextEl.textContent = '';
  isTyping = true;
  canProgress = false;

  handleAction(action);

  let index = 0;
  const speed = 40;

  function type() {
    if (index < text.length) {
      dialogueTextEl.textContent += text[index];
      index++;
      typewriterTimeout = setTimeout(type, speed);
    } else {
      isTyping = false;
      canProgress = true;
      clickPrompt.classList.add('visible');
      if (callback) callback();
    }
  }
  type();
}

function skipTyping(text) {
  if (typewriterTimeout) clearTimeout(typewriterTimeout);
  dialogueTextEl.textContent = text;
  isTyping = false;
  canProgress = true;
  clickPrompt.classList.add('visible');
}

function hideDialogue() {
  dialogueBox.classList.remove('visible');
  clickPrompt.classList.remove('visible');
}

// ============================================
// 씬 전환
// ============================================

function fadeOut(callback) {
  container.classList.remove('fade-in');
  container.classList.add('fade-out');
  setTimeout(callback, 500);
}

function fadeIn() {
  container.classList.remove('fade-out');
  container.classList.add('fade-in');
}

function resetState() {
  charA = { x: 25, targetX: 25, frame: 0, state: 'idle' };
  charB = { x: 45, targetX: 45, frame: 0, state: 'idle' };
  speaker = { x: WIDTH/2 - 4, state: 'idle', opacity: 0.15 };
  childrenOpacity = 1;
  showScarf = false;
  snowIntensity = 1;
  charsOpacity = 1;
  faceY = 0;
  eyeState = 'open';
  screenShake = 0;
}

function startScene(sceneName) {
  currentScene = sceneName;
  dialogueIndex = 0;
  hideDialogue();

  // 타이틀 화면 숨기기
  if (sceneName !== 'title') {
    titleScreen.classList.add('hidden');
  } else {
    titleScreen.classList.remove('hidden');
  }

  if (sceneName === 'scene1') resetState();
  if (sceneName === 'scene2') { faceY = 0; eyeState = 'open'; }
  if (sceneName === 'scene3') { childrenOpacity = 1; speaker.opacity = 0.15; speaker.state = 'idle'; speaker.x = WIDTH/2 - 4; }
  if (sceneName === 'scene3b') { speaker.opacity = 0.6; speaker.state = 'idle'; speaker.x = WIDTH/2 - 4; }

  fadeOut(() => {
    setTimeout(() => {
      fadeIn();
      setTimeout(progressDialogue, 500);
    }, 300);
  });
}

// ============================================
// 게임 진행
// ============================================

function progressDialogue() {
  let sceneDialogues;

  switch (currentScene) {
    case 'title': startScene('scene1'); return;
    case 'scene1': sceneDialogues = dialogues.scene1; break;
    case 'scene2': sceneDialogues = dialogues.scene2; break;
    case 'scene3': sceneDialogues = dialogues.scene3; break;
    case 'scene3b': sceneDialogues = dialogues.scene3b; break;
    case 'ending': sceneDialogues = dialogues.ending; break;
    default: return;
  }

  if (dialogueIndex >= sceneDialogues.length) {
    switch (currentScene) {
      case 'scene1': startScene('scene2'); break;
      case 'scene2': startScene('scene3'); break;
      case 'scene3': startScene('scene3b'); break;
      case 'scene3b': startScene('ending'); break;
      case 'ending': hideDialogue(); currentScene = 'title'; dialogueIndex = 0; resetState(); break;
    }
    return;
  }

  const d = sceneDialogues[dialogueIndex];
  showDialogue(d.speaker, d.text, d.action);
  dialogueIndex++;
}

// ============================================
// 입력 처리
// ============================================

document.addEventListener('click', () => {
  if (currentScene === 'title') { progressDialogue(); return; }
  if (isTyping) {
    const d = dialogues[currentScene];
    if (d && dialogueIndex > 0) skipTyping(d[dialogueIndex - 1].text);
  } else if (canProgress) {
    progressDialogue();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    document.dispatchEvent(new Event('click'));
  }
});

// ============================================
// 게임 루프
// ============================================

const titleScreen = document.getElementById('title-screen');

function gameLoop() {
  time++;
  update();

  switch (currentScene) {
    case 'title':
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      updateAndDrawSnow();
      // 타이틀 텍스트는 HTML로 표시
      break;
    case 'scene1': renderScene1(); break;
    case 'scene2': renderScene2(); break;
    case 'scene3':
    case 'scene3b': renderScene3(); break;
    case 'ending': renderEnding(); break;
  }

  requestAnimationFrame(gameLoop);
}

// ============================================
// 초기화
// ============================================

function init() {
  initSnow(60);
  container.style.setProperty('--fade-opacity', '1');
  fadeIn();
  gameLoop();
}

init();
