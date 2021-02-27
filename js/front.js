"use strict";

/**
 * front.js
 * 
 * フロントUIに関する処理
 */


/* ============================== ファイル処理系 ============================== */

/**
 * 新規盤面作成
 */
function newFile(evt) {
  if (confirm('新規作成しますか？\n（※この操作は元に戻せません）')) {
    Sudokizer.board = new Board();         // 盤面初期化
    Sudokizer.astack = new ActionStack();  // アクションスタック初期化
    redraw();
  }
}
/**
 * 新規盤面作成（戻るで復帰可能バージョン）
 * とりあえず実装だけしておくが今は使っていない
 */
/*
function newFile(evt) {
  if (confirm('新規作成しますか？')) {
    let ret = Sudokizer.board.clear();    // 新規作成せず盤面状態を消去
    Sudokizer.board = ret[0];                     // 消去後の盤面に差し替え
    Sudokizer.astack.push(new Action(ret[1]));    // 差分をプッシュ
    redraw();
  }
}

/**
 * URL出力
 */
function urlWrite(evt) {
  let urlprefix = '';
  if ($('#menu_urlwrite_puzzlink').prop('checked')) {
    urlprefix = 'https://puzz.link/p';
  } else {
    urlprefix = 'http://pzv.jp/p.html';
  }
  let reedit = $('#menu_urlwrite_reedit').prop('checked');
  let url = urlprefix + '?' + Sudokizer.board.urlWrite(reedit);
  // URL表示
  $('#url_output').val(url);
  if (Sudokizer.config.debugmode) {
    console.log(url);
  }
}

/**
 * 画像出力
 */
function imgWrite(evt) {
  // ファイル名取得
  let filename = $('#menu_imgwrite_filename').val();
  let canvas = document.querySelector('#main_board');
  // let csize = $('#menu_imgwrite_dispsize').val();
  // 保存用に一時的に描画モードを変更
  drawForDownload();
  // 画像保存
  canvas.toBlob((blob) => {
    let dlanchor = document.createElement('a');
    dlanchor.href = window.URL.createObjectURL(blob);
    dlanchor.download = filename;
    dlanchor.click();
    dlanchor.remove();
  })
  // 元の盤面に戻す
  redraw();
}

/**
 * pencilBox形式読み込み
 */
function pencilBoxRead(evt) {
  let file = $('#menu_pbread_fileform').prop('files')[0];
  let reader = new FileReader();
  reader.readAsText(file, 'Shift-JIS');
  reader.onload = function() {
    // 改行コードの違いを考慮
    let lines = reader.result.split('\r\n');
    if (lines.length === 1) {
      lines = lines[0].split('\n');
    }
    let ret;
    if (lines[0] === '--') {
      ret = Sudokizer.board.pbReadNikolicom(lines)
    } else {
      ret = Sudokizer.board.pbReadNormal(lines)
    } 
    // 盤面設定とアクションスタック操作
    Sudokizer.board = ret.newboard;
    Sudokizer.astack.push(new Action(ret.actionlist));
    // 著者情報の設定
    $('#menu_pbwrite_authorja').val(ret.authorinfo[0]);
    $('#menu_pbwrite_authoren').val(ret.authorinfo[1]);
    redraw();
  }
}

/**
 * pencilBox出力
 */
function pencilBoxWrite(evt) {
  let filename = $('#menu_pbwrite_filename').val();
  let authorinfo = [$('#menu_pbwrite_authorja').val(),
                    $('#menu_pbwrite_authoren').val()];
  let filestring = '';
  if ($('#menu_pbwrite_normal').prop('checked')) {
    filestring = Sudokizer.board.pbWriteNormal(authorinfo);
  } else {
    // nikolicom仕様の場合、事前にバリデーションが必要
    if (!Sudokizer.board.validateNikolicom()) {
      return;
    };
    filestring = Sudokizer.board.pbWriteNikolicom(authorinfo);
  }
  let dlanchor = document.createElement('a');
  dlanchor.href = URL.createObjectURL(new Blob([filestring], {type: "text/plain"}));
  dlanchor.download = filename;
  dlanchor.click();
  dlanchor.remove();
}

/* =========================== 盤面変換系 ================================= */

/**
 * 現在の盤面を新しいウィンドウにコピー
 */
function boardNewWindow(evt) {
  let preurl = location.href.split('?')[0];    // URL本体取得
  let puzurl = Sudokizer.board.urlWrite(false);  // パズル部分取得
  open(preurl + '?' + puzurl);
}
/**
 * 90度右回転
 */
function boardRotate90Deg(evt) {
  let ret = Sudokizer.board.transform('rotate90');
  Sudokizer.board = ret[0];              // 盤面更新
  Sudokizer.astack.push(new Action(ret[1]));         // アクション追加
  redraw();
}
/**
 * 180度右回転
 */
function boardRotate180Deg(evt) {
  let ret = Sudokizer.board.transform('rotate180');
  Sudokizer.board = ret[0];              // 盤面更新
  Sudokizer.astack.push(new Action(ret[1]));         // アクション追加
  redraw();
}
/**
 * 90度左回転
 */
function boardRotate270Deg(evt) {
  let ret = Sudokizer.board.transform('rotate270');
  Sudokizer.board = ret[0];              // 盤面更新
  Sudokizer.astack.push(new Action(ret[1]));         // アクション追加
  redraw();
}
/**
 * 上下反転
 */
function boardInverseUD(evt) {
  let ret = Sudokizer.board.transform('inverseUD');
  Sudokizer.board = ret[0];              // 盤面更新
  Sudokizer.astack.push(new Action(ret[1]));         // アクション追加
  redraw();
}
/**
 * 左右反転
 */
function boardInverseLR(evt) {
  let ret = Sudokizer.board.transform('inverseLR');
  Sudokizer.board = ret[0];              // 盤面更新
  Sudokizer.astack.push(new Action(ret[1]));         // アクション追加
  redraw();
}


/* ============================= 表示設定系 ================================ */

/**
 * 表示サイズ設定 ＜完成＞
 */
function setCellSize(evt) {
  let sizeobj = $('#menu_dispsize_size');
  let csize = sizeobj.val();
  // 有効範囲にいる場合のみ変更
  if (csize >= sizeobj.attr('min') && csize <= sizeobj.attr('max')) {
    Sudokizer.config.dispsize = csize;
  }
  // デバッグモード
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/**
 * 表示色設定 ＜完成＞
 */
function setColor(evt) {
  // 変化があった要素を特定。thisでとってこれる。
  let aftercolor = $(this).val();
  let propname = $(this).attr('id').substr(-2);
  Sudokizer.config.colorset[propname] = aftercolor;
  // デバッグモード
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/**
 * 色設定デフォルト ＜完成＞
 */
function setColorDefault(evt) {
  // defcolorset を colorset に shallow copy
  Sudokizer.config.colorset = Object.assign({}, Sudokizer.config.defcolorset);
  // フォーム側に色を反映
  for (let propname in Sudokizer.config.colorset) {
    $('#menu_dispcolor_' + propname).val(Sudokizer.config.colorset[propname]);
  }
  // デバッグモード
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/* ============================= デバッグモード ============================= */

/**
 * デバッグモード切替 ＜完成＞
 */
function debugMode(evt) {
  Sudokizer.config.debugmode = !Sudokizer.config.debugmode;
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
}

/* ============================= 入力モード設定 ============================== */

/**
 * 問題入力モード ＜完成＞
 */
function setQMode(evt) {
  Sudokizer.config.qamode = 'question';
  redraw();
}
/**
 * 解答入力モード ＜完成＞
 */
function setAMode(evt) {
  Sudokizer.config.qamode = 'answer';
  redraw();
}
/**
 * 候補入力モード ＜完成＞
 */
function switchKMode(evt) {
  Sudokizer.config.kouhomode = !Sudokizer.config.kouhomode;
  redraw();
}

/* ================================ 盤面編集 ================================= */

/**
 * undo
 */
function actionUndo(evt) {
  Sudokizer.astack.undo();
  redraw();
}
/**
 * redo
 */
function actionRedo(evt) {
  Sudokizer.astack.redo();
  redraw();
}

/**
 * 解答消去
 */
function answerClear(evt) {
  let ret = Sudokizer.board.ansClear();  // [newboard, diff]
  Sudokizer.board = ret[0];              // 盤面更新
  Sudokizer.astack.push(new Action(ret[1]));         // アクション追加
  redraw();
}

/**
 * 候補消去
 */
function kouhoClear(evt) {
  let ret = Sudokizer.board.kouhoClear();    // [newboard, diff]
  Sudokizer.board = ret[0];                  // 盤面更新
  Sudokizer.astack.push(new Action(ret[1])); // アクション追加
  redraw();
}

/**
 * 仮定レベル変更 ＜完成＞
 */
function setKateiLevel(evt) {
  Sudokizer.config.kateilevel = Number($('#opform_kateilevel').val());
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}



/* ================================ 制作支援 ================================= */

/**
 * 解答チェック
 */
function answerCheck(evt) {
  let okflg = Sudokizer.engine.ansCheck(Sudokizer.board);
  alert(okflg ? '正解です' : '不正解です');
}

/**
 * 候補自動洗い出し
 */
function autoKouho(evt) {
  let ret = Sudokizer.engine.autoIdentifyKouhoWrapper(Sudokizer.board);
  Sudokizer.board = ret[0];              // 盤面更新
  Sudokizer.astack.push(new Action(ret[1]));         // アクション追加
  redraw();
}

/**
 * ？ヒント条件から半自動生成
 */
function autoGenerate(evt) {
  alert('semi-auto generation via ? hints');
  // Sudokizer.astack.push(action);
}

/**
 * 1ステップ解答
 */
function stepSolve(evt) {
  let ret = Sudokizer.engine.oneStepSolve(Sudokizer.board);
  Sudokizer.board = ret[0]
  Sudokizer.astack.push(new Action(ret[1]));
  redraw();
}

/**
 * 全ステップ解答
 */
function allSolve(evt) {
  let ret = Sudokizer.engine.allStepSolve(Sudokizer.board);
  Sudokizer.board = ret[0]
  Sudokizer.astack.push(new Action(ret[1]));
  redraw();
  // 状況提示
  if (ret[2] === 0) {
    alert('解なし');
  } else if (ret[2] === 1) {
    alert('一意解が存在します');
  } else {
    alert('複数解が存在します(' + ret[2] + '個' + (ret[2] >= 100 ? '以上' : '') +')' );
  }
}

/**
 * 手筋ログ追加
 */
function addSolveLog(msg) {
  let former = $('#solvelog_form').val();
  let lines = former.split('\n').length;
  lines = ('000' + lines).slice(-3);   // 行番号を3桁の数字で表示
  let showmsg = lines + ': ' + msg;
  $('#solvelog_form').val(former + showmsg + '\n');
}


/* ================================ Canvas ================================== */

/**
 * 盤面へのクリック
 */
function clickBoard(evt) {
  let csize = Sudokizer.config.dispsize;
  let bsize = Sudokizer.board.bsize;
  let mx = evt.offsetX - Sudokizer.config.drawpadding;  // 盤面座標系のx座標
  let my = evt.offsetY - Sudokizer.config.drawpadding;  // 盤面座標系のy座標
  // 範囲内に収まっているか検査
  if (mx >= 0 && mx < csize * bsize && my >= 0 && my < csize * bsize) {
    let cx = Math.floor(mx / Sudokizer.config.dispsize);  // 盤面の横座標
    let cy = Math.floor(my / Sudokizer.config.dispsize);  // 盤面の縦座標
    let ci = cy * Sudokizer.board.bsize + cx;
    Sudokizer.config.cursorpos = ci;
  }
  redraw();
}

/**
 * 盤面へのキーボード押下
 */
function keyDownBoard(evt) {
  let cursorkeys = ['h', 'j', 'k', 'l', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  let numkeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  // let kateikeys = ['z', 'x', 'c', 'v', 'b'];
  let kateikeys = ['q', 'w', 'e', 'r', 't'];
  let cpos = Sudokizer.config.cursorpos;

  // カーソル移動
  if (cursorkeys.includes(evt.key)) {
    evt.preventDefault();
    keyDownCursorMove(cpos, evt.key);
  }
  // 数字入力
  if (numkeys.includes(evt.key)) {
    keyDownNumInput(cpos, evt.key);
  }
  // ？ヒント入力（問題モードのみ）
  if (evt.key === '-') {
    if (Sudokizer.config.qamode === 'question') {
      if (Sudokizer.board.board[cpos].num === '?') {
        Sudokizer.board.hintDel(cpos);
      } else {
        Sudokizer.board.hintIns(cpos, '?');
      }
    }
  }
  // スペース入力：マスの中身削除
  if (evt.key === ' ') {
    evt.preventDefault();   // 画面移動無効化
    if (Sudokizer.config.qamode === 'question') {
      Sudokizer.board.hintDel(cpos);
    } else {
      Sudokizer.board.ansDel(cpos);
    }
  }
  // 問題解答スイッチ
  if (evt.key === 'F2') {
    if (Sudokizer.config.qamode === 'question') {
      Sudokizer.config.qamode = 'answer';
      $('#opform_qmode').prop("checked", false);
      $('#opform_amode').prop("checked", true);
    } else {
      Sudokizer.config.qamode = 'question';
      $('#opform_qmode').prop("checked", true);
      $('#opform_amode').prop("checked", false);
    }
  }
  // 候補スイッチ
  if (evt.key === 'Shift') {
    Sudokizer.config.kouhomode = !Sudokizer.config.kouhomode;
    // UIの方も連動して状態を変更する
    let chk_status = $('#opform_kmode').prop("checked");
    if (chk_status) {
      $('#opform_kmode').prop("checked", false);
    } else {
      $('#opform_kmode').prop("checked", true);
    }
  }
  // 仮定スイッチ
  if (kateikeys.includes(evt.key)) {
    keyDownKateiSwitch(evt.key);
  }
  // undoとredo
  if (evt.key === 'z' && evt.ctrlKey) {
    Sudokizer.astack.undo();
  }
  if (evt.key === 'y' && evt.ctrlKey) {
    Sudokizer.astack.redo();
  }
  redraw();
}

/**
 * 矢印キーによるカーソル移動
 * @param int cpos: 現在のカーソル位置
 * @param string keycode: キーボードのコード
 */
function keyDownCursorMove(cpos, keycode) {
  let bs = Sudokizer.board.bsize;  // 9
  // 上
  if (keycode === 'k' || keycode === 'ArrowUp') {
    if (Math.floor(cpos / bs) !== 0) {
      Sudokizer.config.cursorpos = cpos - bs;
    }
  }
  // 下
  if (keycode === 'j' || keycode === 'ArrowDown') {
    if (Math.floor(cpos / bs) !== bs - 1) {
      Sudokizer.config.cursorpos = cpos + bs;
    }
  }
  // 左
  if (keycode === 'h' || keycode === 'ArrowLeft') {
    if (cpos % bs !== 0) {
      Sudokizer.config.cursorpos = cpos - 1;
    }
  }
  // 右
  if (keycode === 'l' || keycode === 'ArrowRight') {
    if (cpos % bs !== bs - 1) {
      Sudokizer.config.cursorpos = cpos + 1;
    }
  }
}

/**
 * 数字キーによる数字入力
 * @param int cpos: 現在のカーソル位置
 * @param string keycode: 入力されたキー
 */
function keyDownNumInput(cpos, keycode) {
  // 通常数字入力
  if (!Sudokizer.config.kouhomode) {
    // 問題モード：ヒントON
    if (Sudokizer.config.qamode === 'question') {
      Sudokizer.board.hintIns(cpos, keycode);
    // 解答モード：ヒントじゃない場合に入力、仮定レベル設定
    } else {
      if (!Sudokizer.board.board[cpos].ishint) {
        Sudokizer.board.ansIns(cpos, keycode, Sudokizer.config.kateilevel);
      }
    }
  // 候補数字入力
  } else {
    // 問題モード：？ヒントの場合、除外候補を設定
    if (Sudokizer.config.qamode === 'question') {
      if (Sudokizer.board.board[cpos].ishint && 
          Sudokizer.board.board[cpos].num === '?') {
        Sudokizer.board.exkouhoSet(cpos, keycode);
      }
    // 解答モード：候補数字を設定
    } else {
      if (!Sudokizer.board.board[cpos].ishint && 
          Sudokizer.board.board[cpos].num === '0') {
        Sudokizer.board.kouhoSet(cpos, keycode, Sudokizer.config.kateilevel);
      }
    }
  }
}

/**
 * キーボードにより仮定レベルの切り替え
 */
function keyDownKateiSwitch(keycode) {
  if (keycode === 'q') {
    Sudokizer.config.kateilevel = 0;
  } else if (keycode === 'w') {
    Sudokizer.config.kateilevel = 1;
  } else if (keycode === 'e') {
    Sudokizer.config.kateilevel = 2;
  } else if (keycode === 'r') {
    Sudokizer.config.kateilevel = 3;
  } else if (keycode === 't') {
    Sudokizer.config.kateilevel = 4;
  } else {
    throw 'keyDownKateiSwitch Invalid KeyCode';
  }
  // フォーム側も同期
  $('#opform_kateilevel').val(Sudokizer.config.kateilevel);
}

/* ==============================================================
 *                        盤面描画ルーチン
 * =============================================================
 */

/**
 * 盤面再描画用呼び出しルーチン
 * Sudokizerの中身が変わった際に呼び出す実装
 * ＜※　再描画他、様々なイベント発生時の後処理として使用する＞
 */
function redraw() {
  let drawconfig = {
    'cursor': false,
    'dispsize': Sudokizer.config.dispsize,
  }
  // canvasフォーカス時のみカーソルを表示
  if (document.activeElement.getAttribute('id') === 'main_board') {
    drawconfig.cursor = true;
  }
  
  if (Sudokizer.config.drawmedia === 'canvas') {
    Sudokizer.board.drawBoardCanvas(drawconfig);
  } else if (Sudokizer.config.drawmedia === 'svg') {
    Sudokizer.board.drawBoardSVG(drawconfig);
  } else {
    if (Sudokizer.config.debugmode) {
      Sudokizer.board.drawBoardConsole();
    }
  }

  // 再描画以外の諸々の同期処理
  sync_undoredo();     // 戻る、進むボタンのdisabled状態制御
}

/**
 * 盤面保存用描画ルーチン
 * カーソルを描画しない等の別処理
 */
function drawForDownload() {
  let drawconfig = {
    'cursor': false,
    'dispsize': $('#menu_imgwrite_size').val(),
  };
  Sudokizer.board.drawBoardCanvas(drawconfig);
}

/**
 * Undo, Redoボタンの状態同期
 */
function sync_undoredo() {
  // Undo: スタックが空 (sp = 0) のとき
  if (Sudokizer.astack.sp === 0) {
    $('#opform_undo').prop('disabled', true);
  } else {
    $('#opform_undo').prop('disabled', false);
  }
  // Redo: スタックが最新 (sp = spmax) のとき
  if (Sudokizer.astack.sp === Sudokizer.astack.spmax) {
    $('#opform_redo').prop('disabled', true);
  } else {
    $('#opform_redo').prop('disabled', false);
  }
}