"use strict";

/**
 * init.js
 * 
 * ページ読み込み時に実行する初期化用スクリプト
 */

/* =====================================================
 *                グローバル設定類
 * ===================================================== */

let Sudokizer = {};   // グローバル変数をすべてまとめたオブジェクト
Sudokizer.astack = new ActionStack();   // アクションスタック作成
Sudokizer.board  = initBoard();         // 初期盤面の作成
Sudokizer.config = initConfig();        // 全般設定類
Sudokizer.engine = new SdkEngine();     // 解答エンジン
Sudokizer.solvelog = new SolveLog();    // 解答履歴

setEventHandlers();   // イベントハンドラを仕掛ける
redraw();             // 初回同期


/**
 * ページロード時の初期盤面作成
 * @return {Board} 初期盤面
 */
function initBoard() {
  let board = new Board();                  // 新規盤面作成
  let urlparts = location.href.split('?');  // URL取得
  // URLのクエリ部分が空でなければ盤面生成
  if (urlparts.length > 1) {
    board.urlRead(urlparts[1]);
  }
  return board;
}

/**
 * 全般設定用のオブジェクトの作成
 * @return {Object} 全般設定を格納したオブジェクト
 */
function initConfig() {
  // 色情報を取得
  let colorset = {
    'bg': $('#menu_dispcolor_bg').val(),
    'ht': $('#menu_dispcolor_ht').val(),
    'ex': $('#menu_dispcolor_ex').val(),
    'l0': $('#menu_dispcolor_l0').val(),
    'l1': $('#menu_dispcolor_l1').val(),
    'l2': $('#menu_dispcolor_l2').val(),
    'l3': $('#menu_dispcolor_l3').val(),
    'l4': $('#menu_dispcolor_l4').val(),
  }
  // 色情報の初期値を記憶して戻せるようにしておく
  const defcolorset = Object.assign({}, colorset);

  return {
    'debugmode': false,         // デバッグモード
    'cursorpos': undefined,     // カーソル位置
    'dispsize': Number($('#menu_dispsize_size').val()),  // マスサイズ
    'dispfont': 'sans-serif',         // フォント
    'colorset': colorset,             // 色設定
    'defcolorset': defcolorset,       // デフォルト色設定
    'qamode': $('input:radio[name="modeselect"]:checked').val(),  // 問題 or 解答モード
    'kouhomode': $('#opform_kmode').prop('checked'),              // 候補モードフラグ
    'kateilevel': Number($('#opform_kateilevel').val()),          // 仮定レベル
    'drawmedia': 'canvas',      // 描画する要素 Canvas or svg or console?
    'drawpadding': 13,          // 描画時のパディング
    'drawconfig': {},           // 描画時の種々のフラグ
  };
}

/**
 * 各種ボタン、フォームにイベントハンドラを仕掛ける
 */
function setEventHandlers() {
  // -------- メインメニュー：ファイル --------
  // 新規作成
  $('#menu_newfile').click(newFile);
  // URL出力
  $('#menu_urlwrite_ok').click(urlWrite);
  // 画像出力
  $('#menu_imgwrite_ok').click(imgWrite);
  // pencilbox読み込み
  $('#menu_pbread_fileform').change(pencilBoxRead);
  $('#menu_pbread_ok').click(pencilBoxRead);
  // pencilbox出力
  $('#menu_pbwrite_ok').click(pencilBoxWrite);
  
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
  // 色設定
  $('[id^="menu_dispcolor"]').change(setColor);
  // 色設定デフォルト
  $('#menu_color_reset').click(setColorDefault);
  // デバッグモード
  $('#menu_debugmode').click(debugMode);

  // -------- 右フォーム：入力モード --------
  // 問題入力モード
  $('#opform_qmode').change(setQMode);
  // 解答入力モード
  $('#opform_amode').change(setAMode);
  // 候補入力モード
  $('#opform_kmode').change(switchKMode);
  
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
  $('#main_board').on('contextmenu', clickBoard)
  $('#main_board').keydown(keyDownBoard);
  // $('#main_board').blur(redraw);
  $('#main_board').blur(blurBoard);

  // -------- ページ離脱時の警告 ----------
  window.addEventListener('beforeunload', function(evt) {
    let msg = '変更が失われますが、よろしいですか？';
    evt.returnValue = msg;
    return msg;
  })
}
