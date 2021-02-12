"use strict";

/**
 * init.js
 * 
 * ページ読み込み時に実行する初期化用スクリプト
 */

/**
 * グローバル変数類の初期化処理
 */

// Sudokizerグローバル変数。
// グローバル設定類はすべてこのオブジェクトに格納
let Sudokizer = {};

Sudokizer.bsize = 9;
Sudokizer.astack = initActionStack();   // アクションスタック作成
Sudokizer.board  = initBoard();         // 初期盤面の作成
Sudokizer.config = initConfig();        // フォーム設定類
console.log(Sudokizer.board);
console.log(Sudokizer.config);

setEventHandlers();   // イベントハンドラを仕掛ける
redraw();             // 初回描画


/**
 * ページロード時の初期盤面作成
 */
function initBoard() {
  // 新規盤面生成
  let board = new Board();
  // URL取得
  let urlparts = location.href.split('?');
  // URLのクエリ部分が空でなければ盤面生成
  if (urlparts.length > 1) {
    board.urlRead(urlparts[1]);
  }
  
  return board;
}

/**
 * グローバル設定オブジェクトの作成
 */
function initConfig() {

  let colorset = {'bg': '#ffffff'}   // 色設定をHTMLから取得
  const defcolorset = Object.assign({}, colorset);

  return {
    'dispsize': 32,
    'dispfont': 'ゴシック体',
    'colorset': colorset,
    'defcolorset': defcolorset,
    'qamode': 'question',
    'kouhomode': false,
    'kateilevel': 0,
    'drawmedia': 'console',      // 描画する要素 Canvas or svg or console?
    'debugmode': false,         // デバッグモード
  };
}

/**
 * アクションスタック作成。
 * これはコンストラクタ呼び出しでいいかもしれない。
 */
function initActionStack() {
  return {
    'ActionStack': 'OK',
  };
}

/**
 * 各種ボタン、フォームにイベントハンドラを仕掛ける
 */
function setEventHandlers() {
  // -------- メインメニュー：ファイル --------
  // 新規作成
  $('#menu_newfile').click(newFile);
  // ぱずぷれURL出力
  $('#menu_urlwrite_puzpre').click(urlWritePuzpre);
  // puzzlink URL出力
  $('#menu_urlwrite_puzzlink').click(urlWritePuzzlink);
  // 画像出力
  $('#menu_imgwrite_ok').click(imgWrite);
  // pencilbox読み込み
  $('#menu_pbread_ok').click(pencilBoxRead);
  // pencilbox出力
  $('#menu_pbwrite_ok').click(pencilBoxWrite);
  // テキスト読み込み
  $('#menu_txtread_ok').click(easyTextRead);
  // テキスト書き込み
  $('#menu_txtwrite_ok').click(easyTextWrite);
  
  // -------- メインメニュー：編集 ----------
  // 盤面の複製
  $('#menu_boardcopy').click(boardNewWindow);
  // 盤面90回転
  $('#menu_rotate90').click(boardRotate90Deg);
  // 盤面180回転
  $('#menu_rotate180').click(boardRotate180Deg);
  // 盤面270回転
  $('#menu_rotate270').click(boardRotate270Deg);
  // 盤面上下反転
  $('#menu_inverse_ud').click(boardInverseUD);
  // 盤面左右反転
  $('#menu_inverse_lr').click(boardInverseLR);

  // -------- メインメニュー：表示 --------
  // 表示サイズ
  $('#menu_dispsize_ok').click(setCellSize);
  // フォント
  $('[id^="menu_font"]').click(setFont);
  // 色設定
  $('[id^="menu_dispcolor"]').change(setColor);
  // 色設定デフォルト
  $('#menu_color_reset').click(setColorDefault);
  // デバッグモード
  $('#menu_debugmode').click(debugMode);

  // -------- 右フォーム：入力モード --------
  // 問題入力モード
  $('#opform_qmode').click(setQMode);
  // 解答入力モード
  $('#opform_amode').click(setAMode);
  // 候補入力モード
  $('#opform_kmode').click(switchKMode);
  
  // -------- 右フォーム：編集 --------
  // アンドゥ
  $('#opform_undo').click(actionUndo);
  // リドゥ
  $('#opform_redo').click(actionRedo);
  // 解答消去
  $('#opform_ansclear').click(answerClear);
  // 候補消去
  $('#opform_kouhoclear').click(kouhoClear);
  // 仮定レベル
  $('#opform_kateilevel').change(setKateiLevel);

  // -------- 右フォーム：制作支援 --------
  // 解答チェック
  $('#opform_anscheck').click(answerCheck);
  // 自動候補入力
  $('#opform_autokouho').click(autoKouho);
  // 半自動生成
  $('#opform_autogen').click(autoGenerate);
  // 1ステップ解答
  $('#opform_stepsolve').click(stepSolve);
  // 全回答
  $('#opform_autosolve').click(allSolve);

  // -------------- Canvas --------------
  $('#main_board').click(clickBoard);
  $('#main_board').keydown(keyDownBoard);
}
