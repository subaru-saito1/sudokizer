"use strict";

/**
 * front.js
 * 
 * フロントエンドインタフェースに関する処理
 */


/* ============================== ファイル処理系 ============================== */

/**
 * 新規盤面作成
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function newFile(evt) {
  if (confirm('新規作成しますか？\n（※この操作は元に戻せません）')) {
    Sudokizer.board = new Board();         // 盤面初期化
    Sudokizer.astack = new ActionStack();  // アクションスタック初期化
    Sudokizer.solvelog.clear();            // ログクリア
    Sudokizer.drawer.redraw(Sudokizer.board);
  }
}

/**
 * 新規盤面作成（戻るで復帰可能バージョン）
 * とりあえず実装だけしておくが今は使っていない
 * @param {Event} evt イベントオブジェクト（未使用）
 */
/*
function newFile(evt) {
  if (confirm('新規作成しますか？')) {
    let ret = Sudokizer.board.clear();            // 盤面状態を消去
    Sudokizer.board = ret[0];                     // 消去後の盤面に差し替え
    Sudokizer.astack.push(new Action(ret[1]));    // 差分をプッシュ
    Sudokizer.solvelog.clear();                   // ログクリア
    Sudokizer.drawer.redraw(Sudokizer.board);
  }
}

/**
 * URL出力
 * @param {Event} evt イベントオブジェクト（未使用）
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
}

/**
 * 画像出力
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function imgWrite(evt) {
  // ファイル名取得
  let filename = $('#menu_imgwrite_filename').val();
  let canvas = document.querySelector('#main_board');
  // 保存用にいったん別モードで描画
  Sudokizer.drawer.redraw(Sudokizer.board, {
      'cursor': false,
      'dispsize': $('#menu_imgwrite_size').val(),
      'cellerror': false,
    });
  // 画像保存
  canvas.toBlob((blob) => {
    let dlanchor = document.createElement('a');
    dlanchor.href = window.URL.createObjectURL(blob);
    dlanchor.download = filename;
    dlanchor.click();
    dlanchor.remove();
  })
  // 元の盤面を再描画
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * pencilBox形式読み込み
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function pencilBoxRead(evt) {
  let file = $('#menu_pbread_fileform').prop('files')[0];
  let reader = new FileReader();
  reader.readAsText(file, 'Shift-JIS');
  reader.onload = function() {
    // 改行コードの違いを考慮しつつ分割
    let lines = reader.result.split('\r\n');
    if (lines.length === 1) {
      lines = lines[0].split('\n');
    }
    // 先頭行を見てどの形式なのか自動判断
    let ret;
    if (lines[0] === '--') {
      ret = Sudokizer.board.pbReadNikolicom(lines);
    } else if (lines[0].length === 1) {
      ret = Sudokizer.board.pbReadNormal(lines);
    } else {
      ret = Sudokizer.board.pbReadOriginal(lines);
    }
    // 盤面設定とアクションスタック操作
    Sudokizer.board = ret.newboard;
    Sudokizer.astack.push(new Action(ret.actionlist));
    // 著者情報の設定
    $('#menu_pbwrite_authorja').val(ret.authorinfo[0]);
    $('#menu_pbwrite_authoren').val(ret.authorinfo[1]);
    // ログのクリア
    Sudokizer.solvelog.clear();
    Sudokizer.drawer.redraw(Sudokizer.board);
  }
}

/**
 * pencilBox出力
 * @param {Event} evt イベントオブジェクト（未使用）
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
    let res = Sudokizer.board.validateNikolicom();
    if (!res.ok) {
      alert(res.msg);
      return;
    };
    filestring = Sudokizer.board.pbWriteNikolicom(authorinfo);
  }
  // DL用リンクを一時的に生成してダウンロード
  let dlanchor = document.createElement('a');
  dlanchor.href = URL.createObjectURL(new Blob([filestring], {type: "text/plain"}));
  dlanchor.download = filename;
  dlanchor.click();
  dlanchor.remove();
}

/* =========================== 盤面変換系 ================================= */

/**
 * 現在の盤面を新しいウィンドウにコピー
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function boardNewWindow(evt) {
  let preurl = location.href.split('?')[0];    // URL本体取得
  let puzurl = Sudokizer.board.urlWrite(false);  // パズル部分取得
  open(preurl + '?' + puzurl);
}
/**
 * 盤面変形用ファクトリー関数
 * @param {string} mode 変形モード
 * @return {function} 以下の仕様を持つ盤面変形関数
 *   @param {evt} イベントオブジェクト（未使用）
 */
function boardTransform(mode) {
  return function(evt) {
    let ret = Sudokizer.board.transform(mode);  // 新盤面生成
    Sudokizer.board = ret[0];                  // 盤面更新
    Sudokizer.astack.push(new Action(ret[1])); // アクション追加
    Sudokizer.drawer.redraw(Sudokizer.board);  // 再描画
  }
}
const boardRotate90Deg  = boardTransform('rotate90');
const boardRotate180Deg = boardTransform('rotate180');
const boardRotate270Deg = boardTransform('rotate270');
const boardInverseUD    = boardTransform('inverseUD');
const boardInverseLR    = boardTransform('inverseLR');  


/* ============================= 表示設定系 ================================ */

/**
 * 表示サイズ設定
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function setCellSize(evt) {
  let sizeobj = $('#menu_dispsize_size');
  let csize = sizeobj.val();
  // 有効範囲にいる場合のみ変更
  if (csize >= sizeobj.attr('min') && csize <= sizeobj.attr('max')) {
    Sudokizer.config.dispsize = csize;
    Sudokizer.drawer.default_drawoption.dispsize = csize;
    $('#menu_imgwrite_size').val(csize);
  }
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * 表示色設定
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function setColor(evt) {
  // 変化があった要素を特定。thisでとってこれる。
  let aftercolor = $(this).val();
  let propname = $(this).attr('id').substr(-2);
  Sudokizer.config.colorset[propname] = aftercolor;
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * 色設定デフォルト
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function setColorDefault(evt) {
  // defcolorset を colorset に shallow copy
  Sudokizer.config.colorset = Object.assign({}, Sudokizer.config.defcolorset);
  // フォーム側に色を反映
  for (let propname in Sudokizer.config.colorset) {
    $('#menu_dispcolor_' + propname).val(Sudokizer.config.colorset[propname]);
  }
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/* ============================= デバッグモード ============================= */

/**
 * デバッグモード切替
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function debugMode(evt) {
  Sudokizer.config.debugmode = !Sudokizer.config.debugmode;
  if (Sudokizer.config.debugmode) {
    console.log(Sudokizer.config);
  }
}


/* ============================= 入力モード設定 ============================== */

/**
 * 問題入力モード
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function setQMode(evt) {
  Sudokizer.config.qamode = 'question';
  Sudokizer.drawer.redraw(Sudokizer.board);
}
/**
 * 解答入力モード
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function setAMode(evt) {
  Sudokizer.config.qamode = 'answer';
  Sudokizer.drawer.redraw(Sudokizer.board);
}
/**
 * 候補入力モード
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function switchKMode(evt) {
  Sudokizer.config.kouhomode = !Sudokizer.config.kouhomode;
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * 仮定レベル変更
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function setKateiLevel(evt) {
  Sudokizer.config.kateilevel = Number($('#opform_kateilevel').val());
  Sudokizer.drawer.redraw(Sudokizer.board);
}


/* ================================ 盤面編集 ================================= */

/**
 * undo
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function actionUndo(evt) {
  Sudokizer.astack.undo();
  Sudokizer.drawer.redraw(Sudokizer.board);
}
/**
 * redo
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function actionRedo(evt) {
  Sudokizer.astack.redo();
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * 解答消去
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function answerClear(evt) {
  let ret = Sudokizer.board.ansClear();  // [newboard, diff]
  Sudokizer.board = ret[0];              // 盤面更新
  Sudokizer.astack.push(new Action(ret[1]));  // アクション追加
  Sudokizer.solvelog.clear();            // ログのクリア
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * 候補消去
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function kouhoClear(evt) {
  let ret = Sudokizer.board.kouhoClear();    // [newboard, diff]
  Sudokizer.board = ret[0];                  // 盤面更新
  Sudokizer.astack.push(new Action(ret[1])); // アクション追加
  Sudokizer.drawer.redraw(Sudokizer.board);
}


/* ================================ 制作支援 ================================= */

/**
 * 解答チェック
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function answerCheck(evt) {
  let okflg = Sudokizer.engine.ansCheck(Sudokizer.board);
  alert(okflg ? '正解です' : '不正解です');
}

/**
 * 候補自動洗い出し
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function autoKouho(evt) {
  let ret = Sudokizer.engine.autoIdentifyKouhoWrapper(Sudokizer.board);
  Sudokizer.board = ret[0];                  // 盤面更新
  Sudokizer.astack.push(new Action(ret[1])); // アクション追加
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * ？ヒント条件から半自動生成
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function autoGenerate(evt) {
  Sudokizer.engine.generate(Sudokizer.board);
}

/**
 * 1ステップ解答
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function stepSolve(evt) {
  let ret = Sudokizer.engine.oneStepSolve(Sudokizer.board);
  Sudokizer.board = ret[0]
  Sudokizer.astack.push(new Action(ret[1]));
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * 全ステップ解答
 * @param {Event} evt イベントオブジェクト（未使用）
 */
function allSolve(evt) {
  Sudokizer.solvelog.clear();            // ログのクリア
  let ret = Sudokizer.engine.allStepSolve(Sudokizer.board);
  Sudokizer.board = ret[0]
  Sudokizer.astack.push(new Action(ret[1]));
  Sudokizer.drawer.redraw(Sudokizer.board);
  // 状況提示
  if (ret[2] === 0) {
    alert('解なし');
  } else if (ret[2] === 1) {
    alert('一意解が存在します');
  } else {
    alert('複数解が存在します(' + ret[2] + '個' + (ret[2] >= 100 ? '以上' : '') +')' );
  }
}


/* ================================ Canvas ================================== */

/**
 * 盤面へのクリック
 * @param {Event} evt イベントオブジェクト
 */
function clickBoard(evt) {
  evt.preventDefault();   // 右クリックでメニューが開かないようにする
  let csize = Sudokizer.config.dispsize;
  let bsize = Sudokizer.board.bsize;     // 9
  let bsqrt = Math.sqrt(bsize);          // 3
  let mx = evt.offsetX - Sudokizer.config.drawpadding;  // 盤面座標系のx座標
  let my = evt.offsetY - Sudokizer.config.drawpadding;  // 盤面座標系のy座標
  // 範囲内に収まっているか検査
  if (mx >= 0 && mx < csize * bsize && my >= 0 && my < csize * bsize) {
    let cx = Math.floor(mx / Sudokizer.config.dispsize);  // 盤面の横座標
    let cy = Math.floor(my / Sudokizer.config.dispsize);  // 盤面の縦座標
    let scx = Math.floor(mx * bsqrt / Sudokizer.config.dispsize) % bsqrt // 候補x座標
    let scy = Math.floor(my * bsqrt / Sudokizer.config.dispsize) % bsqrt // 候補y座標
    let ci = cy * Sudokizer.board.bsize + cx;
    let ki = scy * bsqrt + scx + 1;
    clickCell(ci, ki, evt.button);
  }
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * セルへのクリック処理 
 * @param {int} cpos クリックしたセルの位置
 * @param {int} k    候補モードONの場合の候補
 * @param {int} button クリックされたボタン
 */
function clickCell(cpos, k, button) {
  // 未カーソル時はカーソルを合わせるだけ
  if (cpos !== Sudokizer.config.cursorpos) {
    Sudokizer.config.cursorpos = cpos;
  } else {
    //　通常の数字入力
    if (!Sudokizer.config.kouhomode) {
      let nextnum = getNextClickNum(cpos, button);   // 入力予定の数字取得
      if (Sudokizer.config.qamode === 'answer') {
        if (nextnum === '0') {
          Sudokizer.board.ansDel(cpos);
        } else {
          Sudokizer.board.ansIns(cpos, nextnum, Sudokizer.config.kateilevel);
        }
      } else {
        if (nextnum === '0') {
          Sudokizer.board.hintDel(cpos);
        } else {
          Sudokizer.board.hintIns(cpos, nextnum);
        }
      }
    // 候補数字入力
    } else {
      Sudokizer.board.kouhoSet(cpos, k, Sudokizer.config.kateilevel);
    }

  }
}

/**
 * クリック時に、次に入れるべき数字を取得
 * @param {int} cpos    セル番号
 * @param {int} button  0で左、2で右 
 */
function getNextClickNum(cpos, button) {
  let num = Sudokizer.board.board[cpos].num;
  let bsize = Sudokizer.board.bsize;
  let nextnum;
  if (button === 0) {
    if (Sudokizer.config.qamode === 'answer') {
      nextnum = String((Number(num) + 1) % (bsize + 1));
    } else {
      if (num === '0') {
        nextnum = '?';
      } else if (num === '?') {
        nextnum = '1';
      } else {
        nextnum = String((Number(num) + 1) % (bsize + 1));
      }
    }
  } else if (button === 2) {
    if (Sudokizer.config.qamode === 'answer') {
      nextnum = String((Number(num) + bsize) % (bsize + 1));
    } else {
      if (num === '0') {
        nextnum = '?';
      } else if (num === '?') {
        nextnum = '9';
      } else {
        nextnum = String((Number(num) + bsize) % (bsize + 1));
      }
    }
  } else {
    throw 'getNextClickNum: Invalid button id';
  }
  return nextnum;
} 

/**
 * 盤面へのキーボード押下
 * @param {Event} evt イベントオブジェクト
 */
function keyDownBoard(evt) {
  let cursorkeys = ['h', 'j', 'k', 'l', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  let numkeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
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
    keyDownQASwitch();
  }
  // 候補スイッチ
  if (evt.key === 'Shift') {
    keyDownKouhoSwitch();
  }
  // 仮定スイッチ
  if (kateikeys.includes(evt.key)) {
    keyDownKateiSwitch(evt.key);
  }
  // undo
  if (evt.key === 'z' && evt.ctrlKey) {
    Sudokizer.astack.undo();
  }
  // redo
  if (evt.key === 'y' && evt.ctrlKey) {
    Sudokizer.astack.redo();
  }
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * 矢印キーによるカーソル移動
 * @param {int} cpos 現在のカーソル位置
 * @param {string} keycode キーボードのコード
 */
function keyDownCursorMove(cpos, keycode) {
  let bs = Sudokizer.board.bsize;  // 9
  // カーソルがない時は何もしない（盤面の淵をクリックした場合に発生する）
  if (Sudokizer.config.cursorpos === undefined) {
    return;
  }
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
 * @param {int} cpos 現在のカーソル位置
 * @param {string} keycode 入力されたキー
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
    if ((Sudokizer.board.board[cpos].ishint && Sudokizer.board.board[cpos].num === '?') ||
        (!Sudokizer.board.board[cpos].ishint && Sudokizer.board.board[cpos].num === '0')) {
      Sudokizer.board.kouhoSet(cpos, keycode, Sudokizer.config.kateilevel);
    /*　旧候補数字入力ルーチン
    if (Sudokizer.config.qamode === 'question') {
      if (Sudokizer.board.board[cpos].ishint && 
          Sudokizer.board.board[cpos].num === '?') {
        Sudokizer.board.exkouhoSet(cpos, keycode);
      }
    } else {
      if (!Sudokizer.board.board[cpos].ishint && 
          Sudokizer.board.board[cpos].num === '0') {
        Sudokizer.board.kouhoSet(cpos, keycode, Sudokizer.config.kateilevel);
      }
    }
    */
    }
  }
}

/**
 * キーボードによる問題解答モード切替
 */
function keyDownQASwitch() {
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
/**
 * キーボードによる候補モード切替
 */
function keyDownKouhoSwitch() {
  Sudokizer.config.kouhomode = !Sudokizer.config.kouhomode;
  // UIの方も連動して状態を変更する
  let chk_status = $('#opform_kmode').prop("checked");
  if (chk_status) {
    $('#opform_kmode').prop("checked", false);
  } else {
    $('#opform_kmode').prop("checked", true);
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
 * 盤面からフォーカスが外れた時の処理
 * @param {Event} evt: イベントオブジェクト
 */
function blurBoard(evt) {
  Sudokizer.config.cursorpos = undefined;
  Sudokizer.drawer.redraw(Sudokizer.board);
}

/**
 * 候補のハイライトをONにする
 * @param {Event} evt: イベントオブジェクト
 */
function kouhoHighlightOn(evt) {
  let kouho = Number(this.innerHTML);
  Sudokizer.drawer.redraw(Sudokizer.board, {highlight:kouho})
}

/**
 * 候補のハイライトをOFFにする
 * @param {Event} evt: イベントオブジェクト
 */
function kouhoHighlightOff(evt) {
  // let kouho = Number(this.innerHTML);
  Sudokizer.drawer.redraw(Sudokizer.board);
}