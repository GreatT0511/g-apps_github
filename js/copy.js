/**
 * Copy functionality for iframe embedded pages
 * Google Sites等のiframe内でもコピーが動作するように対応
 *
 * 方法の優先順位:
 * 1. Clipboard API (最新・推奨)
 * 2. Selection Range + execCommand (Google Sites対応)
 * 3. textarea + execCommand (レガシー)
 * 4. モーダル表示 (最終手段)
 */

(function() {
  'use strict';

  // モーダルのHTML
  var modalHTML = [
    '<div id="copy-modal" class="copy-modal">',
    '  <div class="copy-modal-content">',
    '    <div class="copy-modal-header">',
    '      <span class="material-symbols-outlined">content_copy</span>',
    '      <span>テキストをコピー</span>',
    '      <button class="copy-modal-close" onclick="closeCopyModal()">&times;</button>',
    '    </div>',
    '    <p class="copy-modal-instruction">下のテキストを選択して <kbd>Ctrl</kbd>+<kbd>C</kbd> (Mac: <kbd>Cmd</kbd>+<kbd>C</kbd>) でコピーしてください</p>',
    '    <textarea id="copy-modal-text" readonly></textarea>',
    '    <div class="copy-modal-actions">',
    '      <button class="copy-modal-select" onclick="selectAllText()">全選択</button>',
    '      <button class="copy-modal-done" onclick="closeCopyModal()">完了</button>',
    '    </div>',
    '  </div>',
    '</div>'
  ].join('\n');

  // モーダルのCSS
  var modalCSS = [
    '.copy-modal {',
    '  display: none;',
    '  position: fixed;',
    '  top: 0;',
    '  left: 0;',
    '  width: 100%;',
    '  height: 100%;',
    '  background: rgba(0,0,0,0.5);',
    '  z-index: 10000;',
    '  align-items: center;',
    '  justify-content: center;',
    '}',
    '.copy-modal.show {',
    '  display: flex;',
    '}',
    '.copy-modal-content {',
    '  background: white;',
    '  border-radius: 12px;',
    '  padding: 20px;',
    '  max-width: 500px;',
    '  width: 90%;',
    '  box-shadow: 0 20px 60px rgba(0,0,0,0.3);',
    '}',
    '.copy-modal-header {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  font-weight: 600;',
    '  font-size: 16px;',
    '  margin-bottom: 12px;',
    '}',
    '.copy-modal-header .material-symbols-outlined {',
    '  color: #3b82f6;',
    '}',
    '.copy-modal-close {',
    '  margin-left: auto;',
    '  background: none;',
    '  border: none;',
    '  font-size: 24px;',
    '  cursor: pointer;',
    '  color: #666;',
    '  line-height: 1;',
    '}',
    '.copy-modal-close:hover {',
    '  color: #333;',
    '}',
    '.copy-modal-instruction {',
    '  font-size: 13px;',
    '  color: #666;',
    '  margin-bottom: 12px;',
    '}',
    '.copy-modal-instruction kbd {',
    '  display: inline-block;',
    '  padding: 2px 6px;',
    '  background: #f3f4f6;',
    '  border: 1px solid #d1d5db;',
    '  border-radius: 4px;',
    '  font-family: monospace;',
    '  font-size: 12px;',
    '}',
    '#copy-modal-text {',
    '  width: 100%;',
    '  min-height: 100px;',
    '  padding: 12px;',
    '  border: 2px solid #3b82f6;',
    '  border-radius: 8px;',
    '  font-family: monospace;',
    '  font-size: 14px;',
    '  resize: vertical;',
    '  background: #f8fafc;',
    '}',
    '#copy-modal-text:focus {',
    '  outline: none;',
    '  border-color: #2563eb;',
    '  background: white;',
    '}',
    '.copy-modal-actions {',
    '  display: flex;',
    '  gap: 8px;',
    '  margin-top: 12px;',
    '  justify-content: flex-end;',
    '}',
    '.copy-modal-select, .copy-modal-done {',
    '  padding: 8px 16px;',
    '  border-radius: 6px;',
    '  font-size: 14px;',
    '  cursor: pointer;',
    '  transition: all 0.2s;',
    '}',
    '.copy-modal-select {',
    '  background: #f3f4f6;',
    '  border: 1px solid #d1d5db;',
    '  color: #374151;',
    '}',
    '.copy-modal-select:hover {',
    '  background: #e5e7eb;',
    '}',
    '.copy-modal-done {',
    '  background: #3b82f6;',
    '  border: 1px solid #3b82f6;',
    '  color: white;',
    '}',
    '.copy-modal-done:hover {',
    '  background: #2563eb;',
    '}',
    // 隠しコピーバッファ用
    '.copy-buffer {',
    '  position: absolute;',
    '  left: -9999px;',
    '  top: 0;',
    '  opacity: 0;',
    '  pointer-events: none;',
    '}'
  ].join('\n');

  // モーダルを閉じる
  window.closeCopyModal = function() {
    var modal = document.getElementById('copy-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  };

  // テキストを全選択
  window.selectAllText = function() {
    var textarea = document.getElementById('copy-modal-text');
    if (textarea) {
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
    }
  };

  // モーダルを表示
  function showCopyModal(text) {
    var modal = document.getElementById('copy-modal');
    var textarea = document.getElementById('copy-modal-text');
    if (modal && textarea) {
      textarea.value = text;
      modal.classList.add('show');
      setTimeout(function() {
        textarea.focus();
        textarea.select();
      }, 100);
    }
  }

  // 初期化時にモーダルを追加
  function initModal() {
    // 既に存在する場合はスキップ
    if (document.getElementById('copy-modal')) return;

    // CSSを追加
    var style = document.createElement('style');
    style.textContent = modalCSS;
    document.head.appendChild(style);

    // HTMLを追加
    var div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);

    // モーダル外クリックで閉じる
    document.getElementById('copy-modal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeCopyModal();
      }
    });

    // Escキーで閉じる
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeCopyModal();
      }
    });
  }

  // コピー機能を初期化
  function initCopyFeature() {
    // モーダルを初期化
    initModal();

    // .copyable クラスを持つ要素にクリックイベントを追加
    document.querySelectorAll('.copyable').forEach(function(el) {
      el.addEventListener('click', function() {
        copyText(this.textContent.trim(), this);
      });
    });

    // .copy-btn ボタンにクリックイベントを追加
    document.querySelectorAll('.copy-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var target = this.getAttribute('data-copy-target');
        var text = '';

        if (target) {
          var targetEl = document.querySelector(target);
          if (targetEl) {
            text = targetEl.textContent.trim();
          }
        } else {
          var parent = this.closest('.prompt-copyable, .prompt-example, .copyable-container');
          if (parent) {
            var clone = parent.cloneNode(true);
            var buttons = clone.querySelectorAll('.copy-btn');
            buttons.forEach(function(b) { b.remove(); });
            text = clone.textContent.trim();
          }
        }

        if (text) {
          copyText(text, this);
        }
      });
    });

    // prompt-example にコピーボタンを自動追加
    document.querySelectorAll('.prompt-example:not(.has-copy-btn)').forEach(function(el) {
      addCopyButton(el);
    });
  }

  // ★ Selection Range を使ったコピー（Google Sites対応）
  function copyWithSelection(text) {
    // 一時的な要素を作成
    var tempEl = document.createElement('div');
    tempEl.className = 'copy-buffer';
    tempEl.textContent = text;
    document.body.appendChild(tempEl);

    try {
      // Range を作成してテキストを選択
      var range = document.createRange();
      range.selectNodeContents(tempEl);

      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      // コピー実行
      var success = document.execCommand('copy');

      // 選択を解除
      selection.removeAllRanges();

      return success;
    } catch (err) {
      console.log('Selection copy failed:', err);
      return false;
    } finally {
      document.body.removeChild(tempEl);
    }
  }

  // textarea を使ったコピー（レガシー）
  function copyWithTextarea(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);

    try {
      textArea.select();
      textArea.setSelectionRange(0, text.length);
      var success = document.execCommand('copy');
      return success;
    } catch (err) {
      console.log('Textarea copy failed:', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }

  // テキストをクリップボードにコピー（複数の方法を試行）
  function copyText(text, feedbackEl) {
    // 方法1: Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showFeedback(feedbackEl, true);
      }).catch(function(err) {
        console.log('Clipboard API failed, trying selection method:', err);
        // 方法2: Selection Range（Google Sites対応）
        if (copyWithSelection(text)) {
          showFeedback(feedbackEl, true);
        } else {
          // 方法3: textarea
          if (copyWithTextarea(text)) {
            showFeedback(feedbackEl, true);
          } else {
            // 方法4: モーダル
            showCopyModal(text);
          }
        }
      });
    } else {
      // Clipboard API非対応の場合
      if (copyWithSelection(text)) {
        showFeedback(feedbackEl, true);
      } else if (copyWithTextarea(text)) {
        showFeedback(feedbackEl, true);
      } else {
        showCopyModal(text);
      }
    }
  }

  // コピー完了のフィードバック表示
  function showFeedback(el, success) {
    if (!el) return;

    if (success) {
      el.classList.add('copied');

      if (el.classList.contains('copy-btn')) {
        var originalHTML = el.innerHTML;
        el.innerHTML = '<span class="material-symbols-outlined">check</span>コピー完了';

        setTimeout(function() {
          el.classList.remove('copied');
          el.innerHTML = originalHTML;
        }, 2000);
      } else {
        setTimeout(function() {
          el.classList.remove('copied');
        }, 2000);
      }
    }
  }

  // プロンプト例にコピーボタンを追加
  function addCopyButton(el) {
    el.classList.add('has-copy-btn');
    el.classList.add('prompt-copyable');

    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>コピー';
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var text = el.textContent.replace('コピー', '').trim();
      copyText(text, btn);
    });

    el.appendChild(btn);
  }

  // DOMContentLoaded で初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopyFeature);
  } else {
    initCopyFeature();
  }

  // グローバルに公開
  window.copyToClipboard = copyText;
  window.initCopyFeature = initCopyFeature;
  window.showCopyModal = showCopyModal;
})();
