//=============================================================================
// TitleImageChange.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.4.4 2018/07/11 1.4.3の修正でタイトル画面が変更される条件を満たした状態でセーブ後にタイトルに戻るで再表示しても変更が反映されない問題を修正
// 1.4.3 2018/06/09 セーブファイル数の上限を大きく増やしている場合にタイトル画面の表示が遅くなる現象を修正
// 1.4.2 2018/04/26 ニューゲーム開始後、一度もセーブしていないデータで進行状況のみをセーブするスクリプトを実行しても設定が反映されない問題を修正
// 1.4.1 2017/07/20 1.4.0で追加した機能で画像やBGMを4つ以上しないとタイトルがずれてしまう問題を修正
// 1.4.0 2017/02/12 画像やBGMを4つ以上指定できる機能を追加
// 1.3.1 2017/02/04 簡単な競合対策
// 1.3.0 2017/02/04 どのセーブデータの進行度を優先させるかを決めるための優先度変数を追加
// 1.2.1 2016/12/17 進行状況のみセーブのスクリプトを実行した場合に、グローバル情報が更新されてしまう問題を修正
// 1.2.0 2016/08/27 進行状況に応じてタイトルBGMを変更できる機能を追加
// 1.1.0 2016/06/05 セーブデータに歯抜けがある場合にエラーが発生する問題を修正
//                  進行状況のみをセーブする機能を追加
// 1.0.0 2016/04/06 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 標題畫面變更插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param GradeVariable
 * @text 遊戲進度變數
 * @desc 遊戲進度對應的變數ID(1...)
 * @default 1
 * @type variable
 *
 * @param PriorityVariable
 * @text 優先變數
 * @desc 當複數的存檔檔案存在時，決定哪個存檔檔案的進行度優先的變數ID(1...)
 * @default 0
 * @type variable
 *
 * @param TitleGrade1
 * @text 標題進度 1
 * @desc 遊戲進度變數在這個值以上的話顯示標題 1 設置。
 * @default 1
 *
 * @param TitleImage1
 * @text 標題背景圖片 1
 * @desc 標題 1 的背景圖片文件名(img/titles1)。
 * @default
 * @require 1
 * @dir img/titles1/
 * @type file
 *
 * @param TitleBgm1
 * @text 標題背景音樂 1
 * @desc 標題 1 演奏的BGM文件名(audio/bgm)。
 * @default
 * @require 1
 * @dir audio/bgm/
 * @type file
 *
 * @param TitleGrade2
 * @text 標題進度 2
 * @desc 遊戲進度變數在這個值以上的話顯示標題 2 設置。
 * @default 2
 *
 * @param TitleImage2
 * @text 標題背景圖片 2
 * @desc 標題 2 的背景圖片文件名(img/titles1)。
 * @default
 * @require 1
 * @dir img/titles1/
 * @type file
 *
 * @param TitleBgm2
 * @text 標題背景音樂 2
 * @desc 標題 2 演奏的BGM文件名(audio/bgm)。
 * @default
 * @require 1
 * @dir audio/bgm/
 * @type file
 *
 * @param TitleGrade3
 * @text 標題進度 3
 * @desc 遊戲進度變數在這個值以上的話顯示標題 3 設置。
 * @default 3
 *
 * @param TitleImage3
 * @text 標題背景圖片 3
 * @desc 標題 3 的背景圖片文件名(img/titles1)。
 * @default
 * @require 1
 * @dir img/titles1/
 * @type file
 *
 * @param TitleBgm3
 * @text 標題背景音樂 3
 * @desc 標題 3 演奏的BGM文件名(audio/bgm)。
 * @default
 * @require 1
 * @dir audio/bgm/
 * @type file
 *
 * @param TitleGradeAfter
 * @text 標題進度 4 以上
 * @desc 如果要使用 4 個以上的標題，需要使用逗號來區分進行度。例(4,5,6)
 * @default
 *
 * @param TitleImageAfter
 * @text 標題背景圖片 4 以上
 * @desc 如果要使用 4 個以上的標題，需要使用逗號來區分背景圖片文件名(img/titles1)。例(aaa,bbb,ccc)
 * @default
 *
 * @param TitleBgmAfter
 * @text 標題背景音樂 4 以上
 * @desc 如果要使用 4 個以上的標題，需要使用逗號來區分BGM文件名(audio/bgm)。例(aaa,bbb,ccc)
 * @default
 *
 * @help 對應遊戲進度變更標題畫面背景與背景音樂。
 * 遊戲進度中指定任意變數，通常反應全部存檔中的最大值為準。
 *
 * 但是，如果單獨指定優先級變數，則基於具有最大變數的檔案的
 * 進度來確定標題畫面變更。
 *
 * 標題畫面最大可以指定3個，複數條件滿足的場合優先順序如下：
 *
 * 1. 4之後的畫面以及BGM
 * 2. 標題 3 的畫面以及BGM
 * 3. 標題 2 的畫面以及BGM
 * 4. 標題 1 的畫面以及BGM
 * 5. 預設的標題畫面以及BGM
 *
 * 如果只想保存遊戲進度變數而不保存檔案。
 * 請從事件命令的「腳本」執行以下操作：
 * DataManager.saveOnlyGradeVariable();
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName = 'TitleImageChange';

    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value == null ? '' : value;
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getParamArrayString = function(paramNames) {
        var valuesText = getParamString(paramNames);
        if (!valuesText) return [];
        var values = valuesText.split(',');
        for (var i = 0; i < values.length; i++) {
            values[i] = values[i].trim();
        }
        return values;
    };

    var getParamArrayNumber = function(paramNames, min, max) {
        var values = getParamArrayString(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        for (var i = 0; i < values.length; i++) {
            if (!isNaN(parseInt(values[i], 10))) {
                values[i] = (parseInt(values[i], 10) || 0).clamp(min, max);
            } else {
                values.splice(i--, 1);
            }
        }
        return values;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramGradeVariable    = getParamNumber(['GradeVariable', '進行度変数'], 1, 5000);
    var paramPriorityVariable = getParamNumber(['PriorityVariable', '優先度変数'], 0, 5000);
    var paramTitleGrades      = [];
    paramTitleGrades.push(getParamNumber(['TitleGrade1', 'タイトル1の進行度']));
    paramTitleGrades.push(getParamNumber(['TitleGrade2', 'タイトル2の進行度']));
    paramTitleGrades.push(getParamNumber(['TitleGrade3', 'タイトル3の進行度']));
    var paramTitleImages = [];
    paramTitleImages.push(getParamString(['TitleImage1', 'タイトル1の画像']));
    paramTitleImages.push(getParamString(['TitleImage2', 'タイトル2の画像']));
    paramTitleImages.push(getParamString(['TitleImage3', 'タイトル3の画像']));
    var paramTitleBgms = [];
    paramTitleBgms.push(getParamString(['TitleBgm1', 'タイトル1のBGM']));
    paramTitleBgms.push(getParamString(['TitleBgm2', 'タイトル2のBGM']));
    paramTitleBgms.push(getParamString(['TitleBgm3', 'タイトル3のBGM']));
    paramTitleGrades = paramTitleGrades.concat(getParamArrayNumber(['TitleGradeAfter', '以降の進行度'])).reverse();
    paramTitleImages = paramTitleImages.concat(getParamArrayString(['TitleImageAfter', '以降の画像'])).reverse();
    paramTitleBgms   = paramTitleBgms.concat(getParamArrayString(['TitleBgmAfter', '以降のBGM'])).reverse();

    //=============================================================================
    // DataManager
    //  ゲーム進行状況を保存します。
    //=============================================================================
    var _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
    DataManager.makeSavefileInfo      = function() {
        var info = _DataManager_makeSavefileInfo.apply(this, arguments);
        this.setGradeVariable(info);
        return info;
    };

    DataManager.getFirstPriorityGradeVariable = function() {
        this._loadGrade = true;
        var globalInfo    = this.loadGlobalInfo().filter(function(data, id) {
            return this.isThisGameFile(id);
        }, this);
        this._loadGrade = false;
        var gradeVariable = 0;
        if (globalInfo && globalInfo.length > 0) {
            var sortedGlobalInfo = globalInfo.clone().sort(this._compareOrderForGradeVariable);
            if (sortedGlobalInfo[0]) {
                gradeVariable = sortedGlobalInfo[0].gradeVariable || 0;
            }
        }
        return gradeVariable;
    };

    var _DataManager_loadGlobalInfo = DataManager.loadGlobalInfo;
    DataManager.loadGlobalInfo = function() {
        if (this._loadGrade) {
            if (!this._globalInfo) {
                try {
                    var json = StorageManager.load(0);
                    this._globalInfo = json ? JSON.parse(json) : [];
                } catch (e) {
                    console.error(e);
                    this._globalInfo = [];
                }
            }
            return this._globalInfo;
        } else {
            return _DataManager_loadGlobalInfo.apply(this, arguments);
        }
    };

    DataManager._compareOrderForGradeVariable = function(a, b) {
        if (!a) {
            return 1;
        } else if (!b) {
            return -1;
        } else if (a.priorityVariable !== b.priorityVariable && paramPriorityVariable > 0) {
            return (b.priorityVariable || 0) - (a.priorityVariable || 0);
        } else {
            return (b.gradeVariable || 0) - (a.gradeVariable || 0);
        }
    };

    DataManager.saveOnlyGradeVariable = function() {
        var saveFileId = this.lastAccessedSavefileId();
        var globalInfo = this.loadGlobalInfo() || [];
        if (globalInfo[saveFileId]) {
            this.setGradeVariable(globalInfo[saveFileId]);
        } else {
            globalInfo[saveFileId] = this.makeSavefileInfo();
        }
        this.saveGlobalInfo(globalInfo);
    };

    DataManager.setGradeVariable = function(info) {
        info.gradeVariable = $gameVariables.value(paramGradeVariable);
        if (paramPriorityVariable > 0) {
            info.priorityVariable = $gameVariables.value(paramPriorityVariable);
        }
    };

    var _DataManager_saveGlobalInfo = DataManager.saveGlobalInfo;
    DataManager.saveGlobalInfo = function(info) {
        _DataManager_saveGlobalInfo.apply(this, arguments);
        this._globalInfo = null;
    };

    //=============================================================================
    // Scene_Title
    //  進行状況が一定以上の場合、タイトル画像を差し替えます。
    //=============================================================================
    var _Scene_Title_initialize      = Scene_Title.prototype.initialize;
    Scene_Title.prototype.initialize = function() {
        _Scene_Title_initialize.apply(this, arguments);
        this.changeTitleImage();
        this.changeTitleBgm();
    };

    Scene_Title.prototype.changeTitleImage = function() {
        var gradeVariable = DataManager.getFirstPriorityGradeVariable();
        for (var i = 0, n = paramTitleGrades.length; i < n; i++) {
            if (paramTitleImages[i] && gradeVariable >= paramTitleGrades[i]) {
                $dataSystem.title1Name = paramTitleImages[i];
                break;
            }
        }
    };

    Scene_Title.prototype.changeTitleBgm = function() {
        var gradeVariable = DataManager.getFirstPriorityGradeVariable();
        for (var i = 0, n = paramTitleGrades.length; i < n; i++) {
            if (paramTitleBgms[i] && gradeVariable >= paramTitleGrades[i]) {
                $dataSystem.titleBgm.name = paramTitleBgms[i];
                break;
            }
        }
    };
})();

