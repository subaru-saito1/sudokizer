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
  // 新規オブジェクト作成というよりは盤面状態を全リセット
  for (let i = 0; i < Sudokizer.board.numcells; i++) {
    Sudokizer.board.board[i].clear('question');
  }
  redraw();
  // Sudokizer.astack.clear(action);
}

/**
 * ぱずぷれURL出力
 */
function urlWritePuzpre(evt) {
  let urlprefix = 'http://pzv.jp/p.html'
  let url = urlprefix + '?' + Sudokizer.board.urlWrite();
  alert('URL write for puzpre: \n' + url);
  console.log(url);
}

/**
 * puzzlink URL出力
 */
function urlWritePuzzlink(evt) {
  let urlprefix = 'https://puzz.link/p'
  let url = urlprefix + '?' + Sudokizer.board.urlWrite();
  alert('URL write for puzzlink: \n' + url);
  console.log(url);
}

/**
 * 画像出力
 */
function imgWrite(evt) {
  // 1. ファイル名取得
  // 2. 画像保存
  alert('Image Write');
}

/**
 * pencilBox形式読み込み
 */
function pencilBoxRead(evt) {
  alert('pencilBox Read');
  // Sudokizer.astack.push(action);
}

/**
 * pencilBox出力
 */
function pencilBoxWrite(evt) {
  alert('pencilBox Write');
}

/* =========================== 盤面変換系 ================================= */

/**
 * 現在の盤面を新しいウィンドウにコピー
 */
function boardNewWindow(evt) {
  console.log("copy board");
  Sudokizer.board.copyBoard();
}

/**
 * 90度右回転
 */
function boardRotate90Deg(evt) {
  alert('rotate 90deg right');
  // Sudokizer.astack.push(action);
}

/**
 * 180度右回転
 */
function boardRotate180Deg(evt) {
  alert('rotate 180deg');
  // Sudokizer.astack.push(action);
}

/**
 * 90度左回転
 */
function boardRotate270Deg(evt) {
  alert('rotate 90deg left');
  // Sudokizer.astack.push(action);
}

/**
 * 上下反転
 */
function boardInverseUD(evt) {
  alert('inverse up-to-down');
  // Sudokizer.astack.push(action);
}

/**
 * 左右反転
 */
function boardInverseLR(evt) {
  alert('inverse left-to-right');
  // Sudokizer.astack.push(action);
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
    // canvasサイズ変更
    let boardsize = Sudokizer.config.drawpadding * 2 + csize * Sudokizer.board.bsize;
    $('#main_board').attr('width', boardsize);
    $('#main_board').attr('height', boardsize);
  }
  // デバッグモード
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
  redraw();
}

/**
 * フォント設定（なかった）
 */
/*
function setFont(evt) {
  alert('set font');
  redraw();
}
*/

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
  // とりあえずここにメモ: ActionStackのメソッド
  // - undo：ポインタを1個前に戻して盤面をチェックアウト
  // - redo：ポインタを1個次に進めて盤面をチェックアウト
  // - push：現在のポインタの位置にアクションを「破壊的に」追加
  // - clear: actionstack初期化 + redraw()

  // Sudokizer.astack.undo();
  alert('undo')
}

/**
 * redo
 */
function actionRedo(evt) {
  // Sudokizer.astack.redo();
  alert('redo');
}

/**
 * 解答消去
 */
function answerClear(evt) {
  for (let i = 0; i < Sudokizer.board.numcells; i++) {
    Sudokizer.board.board[i].clear('answer');
  }
  redraw();
  // Sudokizer.astack.push(action);
}

/**
 * 候補消去
 */
function kouhoClear(evt) {
  for (let i = 0; i < Sudokizer.board.numcells; i++) {
    Sudokizer.board.board[i].clear('kouho');
  }
  redraw();
  // Sudokizer.astack.push(action);
}

/**
 * 仮定レベル変更 ＜完成＞
 */
function setKateiLevel(evt) {
  Sudokizer.config.kateilevel = $('#opform_kateilevel').val();
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
  alert('answer check');
}

/**
 * 候補自動洗い出し
 */
function autoKouho(evt) {
  alert('auto kouho calculate');
  // Sudokizer.astack.push(action);
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
  alert('stepsolve');
  // Sudokizer.astack.push(action);
}

/**
 * 全ステップ解答
 */
function allSolve(evt) {
  alert('allSolve');
  // Sudokizer.astack.push(action);
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
  let cursorKeys = ['h', 'j', 'k', 'l', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  let numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let cpos = Sudokizer.config.cursorpos;

  // カーソル移動
  if (cursorKeys.includes(evt.key)) {
    evt.preventDefault();   // 矢印キーでの画面移動無効化
    keyDownCursorMove(cpos, evt.key);
  }
  // 数字入力
  if (numKeys.includes(evt.key)) {
    keyDownNumInput(cpos, evt.key);
  }
  // ？ヒント入力（問題モードのみ）
  if (evt.key === '-') {
    if (Sudokizer.config.qamode === 'question') {
      if (Sudokizer.board.board[cpos].num === '?') {
        Sudokizer.board.board[cpos].num = '0';
        Sudokizer.board.board[cpos].ishint = false;
      } else {
        Sudokizer.board.board[cpos].num = '?';
        Sudokizer.board.board[cpos].ishint = true;
      }
    }
  }
  // スペース入力：マスの中身削除
  if (evt.key === ' ') {
    evt.preventDefault();   // 画面移動無効化
    if (Sudokizer.config.qamode === 'question') {
      Sudokizer.board.board[cpos].clear('question');
    } else {
      Sudokizer.board.board[cpos].clear('answer');
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
  redraw();
  // Sudokizer.astack.push(action);
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
      Sudokizer.board.board[cpos].num = keycode;
      Sudokizer.board.board[cpos].ishint = true;
    // 解答モード：ヒントじゃない場合に入力、仮定レベル設定
    } else {
      if (!Sudokizer.board.board[cpos].ishint) {
        Sudokizer.board.board[cpos].num = keycode;
        Sudokizer.board.board[cpos].klevel = Sudokizer.config.kateilevel;
      }
    }
  // 候補数字入力
  } else {
    // 問題モード：？ヒントの場合、除外候補を設定
    if (Sudokizer.config.qamode === 'question') {
      if (Sudokizer.board.board[cpos].ishint && Sudokizer.board.board[cpos].num === '?') {
        Sudokizer.board.board[cpos].exkouho[keycode - 1] = 
          !Sudokizer.board.board[cpos].exkouho[keycode - 1];
      }
    // 解答モード：候補数字を設定
    } else {
      if (!Sudokizer.board.board[cpos].ishint && Sudokizer.board.board[cpos].num === '0')
      Sudokizer.board.board[cpos].kouho[keycode - 1] = 
        !Sudokizer.board.board[cpos].kouho[keycode - 1];
    }
  }
}

/* ==============================================================
 *                        盤面描画ルーチン
 * =============================================================
 */

/**
 * 盤面再描画用呼び出しルーチン
 * Sudokizerの中身が変わった際に呼び出す実装
 */
function redraw() {
  if (Sudokizer.config.drawmedia === 'canvas') {
    Sudokizer.board.drawBoardCanvas();
  } else if (Sudokizer.config.drawmedia === 'svg') {
    Sudokizer.board.drawBoardSVG();
  } else {
    if (Sudokizer.config.debugmode) {
      Sudokizer.board.drawBoardConsole();
    }
  }
}