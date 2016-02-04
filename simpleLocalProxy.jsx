/* 
 * simpleLocalProxy.jsx v1.0
 * https://github.com/berniebernie/after-effects-scripts
 *    
 * Copyright 2015, bernie@berniebernie.fr
 *    
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT  
 *
 * This script embeds js-md5 from github: https://github.com/emn178/js-md5 for practical reasons
 *
 * Script that can be launched or put in the scriptui folder of After Effects to be used as a panel
 *  
 * Copies footage from its current location to one chosen by the user (defaults to /tmp/) and allows to
 * switch original-proxy with a button
 * To be used when file i/o is slow
 *
 *
 */



/*
 * js-md5 v0.1.2
 * https://github.com/emn178/js-md5
 *
 * Copyright 2014, emn178@gmail.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */



/************************************************************************************************************
 *
 *
 *
 *      js-md5.js
 *
 *
 *
 ************************************************************************************************************/


(function(root, undefined){
  'use strict';

  var HEX_CHARS = "0123456789abcdef";
  var HEX_TABLE = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15,
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15
  };

  var R = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
           5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
           4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
           6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];

  var K = [0XD76AA478, 0XE8C7B756, 0X242070DB, 0XC1BDCEEE,
           0XF57C0FAF, 0X4787C62A, 0XA8304613, 0XFD469501,
           0X698098D8, 0X8B44F7AF, 0XFFFF5BB1, 0X895CD7BE,
           0X6B901122, 0XFD987193, 0XA679438E, 0X49B40821,
           0XF61E2562, 0XC040B340, 0X265E5A51, 0XE9B6C7AA,
           0XD62F105D, 0X02441453, 0XD8A1E681, 0XE7D3FBC8,
           0X21E1CDE6, 0XC33707D6, 0XF4D50D87, 0X455A14ED,
           0XA9E3E905, 0XFCEFA3F8, 0X676F02D9, 0X8D2A4C8A,
           0XFFFA3942, 0X8771F681, 0X6D9D6122, 0XFDE5380C,
           0XA4BEEA44, 0X4BDECFA9, 0XF6BB4B60, 0XBEBFBC70,
           0X289B7EC6, 0XEAA127FA, 0XD4EF3085, 0X04881D05,
           0XD9D4D039, 0XE6DB99E5, 0X1FA27CF8, 0XC4AC5665,
           0XF4292244, 0X432AFF97, 0XAB9423A7, 0XFC93A039,
           0X655B59C3, 0X8F0CCC92, 0XFFEFF47D, 0X85845DD1,
           0X6FA87E4F, 0XFE2CE6E0, 0XA3014314, 0X4E0811A1,
           0XF7537E82, 0XBD3AF235, 0X2AD7D2BB, 0XEB86D391];

  var jsmd5 = function(message) {
    var blocks = hasUTF8(message) ? UTF8toBlocks(message) : ASCIItoBlocks(message);
    var h0 = 0x67452301;
    var h1 = 0xEFCDAB89;
    var h2 = 0x98BADCFE;
    var h3 = 0x10325476;

    for(var i = 0, length = blocks.length;i < length;i += 16)
    {
      var a = h0;
      var b = h1;
      var c = h2;
      var d = h3;
      var f, g, tmp, x, y;

      for(var j = 0;j < 64;++j)
      {
        if(j < 16)
        {
          // f = (b & c) | ((~b) & d);
          f = d ^ (b & (c ^ d));
          g = j;
        }
        else if(j < 32)
        {
          // f = (d & b) | ((~d) & c);
          f = c ^ (d & (b ^ c));
          g = (5 * j + 1) % 16;
        }
        else if(j < 48)
        {
          f = b ^ c ^ d;
          g = (3 * j + 5) % 16;
        }
        else
        {
          f = c ^ (b | (~d));
          g = (7 * j) % 16;
        }

        tmp = d;
        d = c
        c = b

        // leftrotate
        x = (a + f + K[j] + blocks[i + g]);
        y = R[j];
        b += (x << y) | (x >>> (32 - y));
        a = tmp;
      }
      h0 = (h0 + a) | 0;
      h1 = (h1 + b) | 0;
      h2 = (h2 + c) | 0;
      h3 = (h3 + d) | 0;
    }
    return toHexString(h0) + toHexString(h1) + toHexString(h2) + toHexString(h3);
  };

  var toHexString = function(num) {
    var hex = "";
    for(var i = 0; i < 4; i++)
    {
      var offset = i << 3;
      hex += HEX_CHARS.charAt((num >> (offset + 4)) & 0x0F) + HEX_CHARS.charAt((num >> offset) & 0x0F);
    }
    return hex;
  };

  var hasUTF8 = function(message) {
    var i = message.length;
    while(i--)
      if(message.charCodeAt(i) > 127)
        return true;
    return false;
  };

  var ASCIItoBlocks = function(message) {
    // a block is 32 bits(4 bytes), a chunk is 512 bits(64 bytes)
    var length = message.length;
    var chunkCount = ((length + 8) >> 6) + 1;
    var blockCount = chunkCount << 4; // chunkCount * 16
    var blocks = [];
    var i;
    for(i = 0;i < blockCount;++i)
      blocks[i] = 0;
    for(i = 0;i < length;++i)
      blocks[i >> 2] |= message.charCodeAt(i) << ((i % 4) << 3);
    blocks[i >> 2] |= 0x80 << ((i % 4) << 3);
    blocks[blockCount - 2] = length << 3; // length * 8
    return blocks;
  };

  var UTF8toBlocks = function(message) {
    var uri = encodeURIComponent(message);
    var blocks = [];
    for(var i = 0, bytes = 0, length = uri.length;i < length;++i)
    {
      var c = uri.charCodeAt(i);
      if(c == 37) // %
        blocks[bytes >> 2] |= ((HEX_TABLE[uri.charAt(++i)] << 4) | HEX_TABLE[uri.charAt(++i)]) << ((bytes % 4) << 3);
      else
        blocks[bytes >> 2] |= c << ((bytes % 4) << 3);
      ++bytes;
    }
    var chunkCount = ((bytes + 8) >> 6) + 1;
    var blockCount = chunkCount << 4; // chunkCount * 16
    var index = bytes >> 2;
    blocks[index] |= 0x80 << ((bytes % 4) << 3);
    for(var i = index + 1;i < blockCount;++i)
      blocks[i] = 0;
    blocks[blockCount - 2] = bytes << 3; // bytes * 8
    return blocks;
  };

  if(typeof(module) != 'undefined')
    module.exports = jsmd5;
  else if(root)
    root.jsmd5 = jsmd5;
}(this));


/************************************************************************************************************
 *
 *
 *
 *      simpleLocalProxy.jsx 
 *
 *
 *
 ************************************************************************************************************/


function e(str){
    $.writeln(str);
}

function pathToLocalizedPath(path){
        f = new File(path);
        return f.fsName.toString();
}

function sequenceFilesWildcard(path){ 
    //returns false or an array with everything before a sequence's image number, and the extension: /c/path/file.0555.exr > { /c/pathfile. ; .exr }
    var myRegexp = /(.*[\.\-_a-z])[\d]{1,}(\.[a-zA-Z]*)$/g; 
    var match = myRegexp.exec(path);
    if(!match){
        return false;
    }else{
        return match;
    }
}
function grabPaths(footage){
    //returns false or the path of the given footage, if it's a file sequence, returns the path with a wildcard for the current frame number: /c/path/file.0555.exr > /c/path/file.*.exr
    var f = footage;
    returnpath = false;
    if(f instanceof FootageItem && f.file != null){       
        var source = f.mainSource.file.toString();
        if(!f.mainSource.isStill){
            var pathFromRegex = sequenceFilesWildcard(source);
            if(pathFromRegex){
                returnpath = pathFromRegex[1]+"*"+pathFromRegex[2];
            }else{
                returnpath = source;
            }
        }else{
            returnpath = source;
        }
    }
    return returnpath;
}

function grabFootagePathsAndCopyToLocal(){
    //main worker function
    
    var sel = app.project.selection;
    if(sel.length < 1 || !(sel[0] instanceof FootageItem)){
        alert("Select footage(s) and try again");    
    }else{
        
        var debugcheck = (getPref("debug","false")=="true")?true:false;
        var useforcecopy = (getPref("forcecopy","false")=="true")?true:false;
        
        var isMacintosh = ($.os.toLowerCase().indexOf("windows")==-1);
        var localSaveDir = getPref("localSaveDir",Folder.temp.toString());
        
        var batchFile = (isMacintosh)?"# bash file used to copy After Effects footage to local storage":"@echo off\nREM batch file to copy After Effects footage to local storage";
        for(i=0;i<app.project.selection.length;i++){
            if(!sel[i].useProxy){
                //grab path from current selection item
                var curPath = grabPaths(sel[i]);
                var fileName = curPath.split('/').pop();
                var dir = curPath.substring(0,curPath.lastIndexOf('/')+1);
                
                var outputDir = "";
                if(getPref("usemd5",true)=="true"){
                    outputDir = localSaveDir + "/"+ jsmd5(dir);
                }else{
                    outputDir = localSaveDir + dir;
                }
            
                if(isMacintosh){
                    //macos uses rsync to copy files
                    
                    batchFile += "\nrsync -v -a ";
                    batchFile += ((useforcecopy)?"-I ":"");
                    batchFile += dir+fileName;
                    batchFile += " "+outputDir;
                    
                }else{
                    //windows uses robocopy
                    
                    batchFile += "\nrobocopy ";
                    batchFile += pathToLocalizedPath(dir);
                    //robocopy filename requires a wildcard, even if it's a single file
                    batchFile += " \""+fileName.replace(/%20/g, " ")+"*\" ";
                    batchFile += pathToLocalizedPath(outputDir);
                    batchFile += ((useforcecopy)?" /XO":"")+" /FFT"+((debugcheck)?"":" /NJH /NJS");
                }
            }
        }
        batchFile += ((debugcheck)?(isMacintosh?"\nread a":"\npause"):""); //nested tertiary operators, sue me
        
        var txtFile;
        if(isMacintosh){
            txtFile = new File(localSaveDir+"/AFX_footage_copy.sh");
        }else{
            txtFile = new File(localSaveDir+"/AFX_footage_copy.bat");
        }
        if(txtFile.open("w","TEXT","????") == true){
            txtFile.write(batchFile);
            txtFile.close();
            txtFile.execute();
        }else{
            alert("Write permission denied on\n"+localSaveDir);
        }
        //txtFile.remove();
    }
}
function grabFootagePathsAndSwitchProxy(){
    var sel = app.project.selection;
    if(sel.length < 1){
        alert("Select footage first");    
    }else{
        for(i=0;i<app.project.selection.length;i++){
            item = sel[i];
            if(item.useProxy){
                item.useProxy = false;
            }else{
                var curPath = grabPaths(item);
                var fileName = item.mainSource.file.toString().split('/').pop();
                var dir = curPath.substring(0,curPath.lastIndexOf('/')+1);
                var localSaveDir = getPref("localSaveDir",Folder.temp.toString());
                var outputDir = "";
                if(getPref("usemd5",true)=="true"){
                    outputDir = localSaveDir + "/"+ jsmd5(dir);
                }else{
                    outputDir = localSaveDir + dir;
                }
                var proxyFilePath = outputDir+"/"+fileName;
                var proxyFile = new File(proxyFilePath);
                e(proxyFilePath);
                if(proxyFile.exists){
                    if(item.mainSource.isStill){
                        item.setProxy(proxyFile);
                    }else{
                        //dirty workaround if the file is a movie file (.mpg, qucktime etc...)
                        try {
                            item.setProxyWithSequence(proxyFile,false);
                        }
                        catch(err) {
                            item.setProxy(proxyFile);
                        }   
                    }
                    item.proxySource.alphaMode = item.mainSource.alphaMode;
                    item.proxySource.premulColor = item.mainSource.premulColor;
                    item.proxySource.invertAlpha= item.mainSource.invertAlpha;
                }else{
                    if(getPref("debug",false)=="true"){
                        alert(">>> NO PROXY FOUND\n"+proxyFilePath);
                    }
                }
            }
        }
    }
}

function setPref(pref,value){
    app.settings.saveSetting("simpleLocalProxy", pref, value);
}
function getPref(pref,defaultValue){
    prefsVar = "simpleLocalProxy";
    if(app.settings.haveSetting(prefsVar, pref)){
        return app.settings.getSetting(prefsVar, pref);
    }else{
        app.settings.saveSetting(prefsVar, pref, defaultValue);
        setPref(pref,defaultValue)
        return defaultValue;
    }
}

function simpleLocalProxy(thisObj) {
    pan = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Simple Local Proxy", [100, 100, 300, 300]);
    
    var securitySetting = app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
    if (securitySetting != 1) {
        pan.add("statictext",[15,15,300,45],"Set prefs and re-launch");
        alert("You need to check \"Allow Scripts to Write Files and Access Network\" in your preferences for this script to work");
    }else{
        var localFolder = getPref("localSaveDir",Folder.temp.toString());
        localFolder = pathToLocalizedPath(localFolder).replace(/\\/g,"\\\\");
        
        // UI DESCRIPTION
        
        res = "group { alignment: ['fill','fill'], alignChildren: ['fill','top'], orientation: 'column', \
                        cols: Group {orientation:'row',align:'left', alignChildren:['fill','top'],\
                            col1: Group {orientation:'column',align:'left', alignChildren:['fill','center'],\
                                saveDirText: StaticText {text: 'Local Copy folder setup: '},\
                                saveDirOptions: Group {orientation:'column',align:'left', alignChildren:['fill','center'],\
                                    usemd5rbox: RadioButton {text: ' Simple',helpTip:'Uses a unique folder name per footage, requires md5.js',value:true},\
                                    usepathrbox: RadioButton {text: ' Copy Folder Structure',helpTip:'Copies the target folder structure inside the local folder'}}},\
                            col2: Group {orientation:'column',align:'left', alignChildren:['fill','center'],\
                                optionsText: StaticText {text: 'Options: '},\
                                optionsGrp: Group {orientation:'column',align:'left', alignChildren:['fill','center'],\
                                    forcecopyChkbox: Checkbox {text: ' Force copy',helpTip:'Overwrite local files (if your render has changed for instance)'},\
                                    debugChkbox: Checkbox {text: ' Debug',helpTip:'Show full batch process and pause at end of copies'}}}},\
                        cols2: Group {orientation:'row',align:'left', alignChildren:['fill','top'],\
                            localSaveDirBut: Button {text: ' Choose Local Folder ' ,preferredSize:[-1,30]} , \
                            browseBut: Button {text: ' Browse ' , preferredSize:[-1,30]}} , \
                        curentDirTxt: EditText {text: '" + localFolder +"',enabled:false},\
                        copyFootageBut: Button {text: ' Copy Footage(s) to Local Folder ' ,helpTip:'Launches a background batch copy of selected footage',preferredSize:[-1,30]} , \
                        switchproxyBut: Button {text: ' Switch Local Proxy/Original ',helpTip:'Switches from original to proxy path and back,  warning if no local copy has been found' ,preferredSize:[-1,30]} , \
                    }";

        //UI DRAW
        
        pan.grp = pan.add(res); 
        pan.layout.layout(true);
        
        //radio buttons and checkboxes prefs
          

        var usemd5 = getPref("usemd5",true);
        pan.grp.cols.col1.saveDirOptions.usemd5rbox.value = (usemd5=="true")?true:false;
        pan.grp.cols.col1.saveDirOptions.usepathrbox.value = (usemd5=="true")?false:true;

        var useforcecopy = getPref("forcecopy","false");
        pan.grp.cols.col2.optionsGrp.forcecopyChkbox.value = (useforcecopy=="true")?true:false;
        var debugcheck = getPref("debug","false");
        pan.grp.cols.col2.optionsGrp.debugChkbox.value = (debugcheck=="true")?true:false;

        pan.layout.resize();
        pan.onResizing = pan.onResize = function () {this.layout.resize();}

        // UI ACTIONS
        
        //browse button
        pan.grp.cols2.browseBut.onClick = function(){
                localSaveDir = new Folder(getPref("localSaveDir",Folder.temp.toString()));
                localSaveDir.execute();
        }
        //choose local folder button
        pan.grp.cols2.localSaveDirBut.onClick = function(){
            localSaveDir = new Folder(getPref("localSaveDir",Folder.temp.toString()));
            o = localSaveDir.selectDlg("Choose folder to copy footage to");
            if(o!=null){
                    setPref("localSaveDir",o.toString());
                    pan.grp.curentDirTxt.text = pathToLocalizedPath(o.toString());//.replace(/\\/g,"\\\\");
            }
        }
    
        pan.grp.copyFootageBut.onClick = function(){
            //copy footages button (launches the 'guts' of this script)
            
            //save prefs
            var usemd5 = pan.grp.cols.col1.saveDirOptions.usemd5rbox.value;
            var useforcecopy = pan.grp.cols.col2.optionsGrp.forcecopyChkbox.value;
            var debugcheck = pan.grp.cols.col2.optionsGrp.debugChkbox.value;
            setPref("usemd5",usemd5);
            setPref("forcecopy",useforcecopy);
            setPref("debug",debugcheck);
            
            grabFootagePathsAndCopyToLocal();
        }
        
        pan.grp.switchproxyBut.onClick = function(){
            //checks for a local copy of the footage, and switches to a proxy accordingly 
            
            //save prefs
            var usemd5 = pan.grp.cols.col1.saveDirOptions.usemd5rbox.value;
            var useforcecopy = pan.grp.cols.col2.optionsGrp.forcecopyChkbox.value;
            var debugcheck = pan.grp.cols.col2.optionsGrp.debugChkbox.value;
            
            setPref("usemd5",usemd5);
            setPref("forcecopy",useforcecopy);
            setPref("debug",debugcheck);

            grabFootagePathsAndSwitchProxy();
        }
    }
    if (pan instanceof Window) pan.show() ;
}
simpleLocalProxy(this);
