
/**
 * init.js
 * 
 * ページ読み込み時に実行する初期化用スクリプト
 */

// Sudokizerグローバルオブジェクト
let Sudokizer = {};

Sudokizer.board = initBoard();         // 初期盤面の作成
Sudokizer.config = getFormConfig();    // フォーム設定類
// 暫定
console.log(Sudokizer);

// イベントハンドラの設定
setEventHandlers();


// 暫定実装
function initBoard() {
  // メモ
  // 1. Boardクラスのコンストラクタを呼び出して空盤面生成
  // 2. URLのGETパラメータがあればそこから盤面を構築する関数を呼び出す
  return {'Board': 'OK'};
}
function getFormConfig() {
  // 含める項目メモ
  // - 表示サイズ
  // - フォント
  // - 各種表示色（背景、ヒント、入力、除外候補、第1～第4仮定）
  // - 問題/解答モード
  // - 候補入力モード
  // - 仮定レベル
  return {
    'dispsize': 32,
    'dispfont': 'ゴシック体'
  };
}


/**
 * 各種ボタン、フォームにイベントハンドラを仕掛ける
 */
function setEventHandlers() {
  // -------- メインメニュー：ファイル --------
  // 新規作成
  $('#menu_newfile').click(alert_test);
  // ぱずぷれURL出力
  $('#menu_urlwrite_puzpre').click(alert_test);
  // puzzlink URL出力
  $('#menu_urlwrite_puzzlink').click(alert_test);
  // 画像出力
  $('#menu_imgwrite_ok').click(alert_test);
  // pencilbox読み込み
  $('#menu_pbread_ok').click(alert_test);
  // pencilbox出力
  $('#menu_pbwrite_ok').click(alert_test);
  // テキスト読み込み
  $('#menu_txtread_ok').click(alert_test);
  // テキスト書き込み
  $('#menu_txtwrite_ok').click(alert_test);
  
  // -------- メインメニュー：編集 ----------
  // 盤面の複製
  $('#menu_boardcopy').click(alert_test);
  // 盤面90回転
  $('#menu_rotate90').click(alert_test);
  // 盤面180回転
  $('#menu_rotate180').click(alert_test);
  // 盤面270回転
  $('#menu_rotate270').click(alert_test);
  // 盤面上下反転
  $('#menu_inverse_ud').click(alert_test);
  // 盤面左右反転
  $('#menu_inverse_lr').click(alert_test);

  // -------- メインメニュー：表示 --------
  // 表示サイズ
  $('#menu_dispsize_ok').click(alert_test);
  // フォント
  $('[id^="menu_font"]').click(alert_test);
  // 色設定
  $('[id^="menu_dispcolor"]').change(alert_test);
  // 色設定デフォルト
  $('#menu_color_reset').click(alert_test);
  // デバッグモード
  $('#menu_debugmode').click(alert_test);

  // -------- 右フォーム：入力モード --------
  // 問題入力モード
  $('#opform_qmode').click(alert_test);
  // 解答入力モード
  $('#opform_amode').click(alert_test);
  // 候補入力モード
  $('#opform_kmode').click(alert_test);
  
  // -------- 右フォーム：編集 --------
  // アンドゥ
  $('#opform_undo').click(alert_test);
  // リドゥ
  $('#opform_redo').click(alert_test);
  // 解答消去
  $('#opform_ansclear').click(alert_test);
  // 候補消去
  $('#opform_kouhoclear').click(alert_test);
  // 仮定レベル
  $('#opform_kateilevel').change(alert_test);

  // -------- 右フォーム：制作支援 --------
  // 解答チェック
  $('#opform_anscheck').click(alert_test);
  // 自動候補入力
  $('#opform_autokouho').click(alert_test);
  // 半自動生成
  $('#opform_autogen').click(alert_test);
  // 1ステップ解答
  $('#opform_stepsolve').click(alert_test);
  // 全回答
  $('#opform_autosolve').click(alert_test);

}

// 仮
function alert_test(e) {
  alert(e);
}
