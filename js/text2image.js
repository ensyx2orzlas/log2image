

// 폰트명
const pretendard = 'pretendard';
const kopubBatang = 'kopubbatang';

function isImageFile(file) {
  var ext = file.name.split(".").pop().toLowerCase();
  return ($.inArray(ext, ["jpg", "jpeg", "gif", "png"]) === -1) ? false : true;
}

function isOverSize(file) {
  var maxSize = 3 * 1024 * 1024; // 3MB로 제한 
  return (file.size > maxSize) ? true : false;
}

function urlToPromise(url) {
  return new Promise(function(resolve, reject) {
    JSZipUtils.getBinaryContent(url, function (err, data) {
      if(err) {
          reject(err);
      } else {
          resolve(data);
      }
    });
  });
}


$(function(){
  
  // 폰트색 피커 연동
  $('#color-font').on('change', function () {
    $('#input-color-font').val($(this).val());
    $('.page').css('--user-font-color', $(this).val());
  });

  // 배경색 피커 연동
  $('#color-background').on('change', function () {
    $('#input-color-background').val($(this).val());
    $('.page').css('--user-bg-color', $(this).val());
  });

  // 배경 이미지 입력 연동
  $('#input-image').on('change', function () {
    var file = this.files;

    if (file && file[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        if (isImageFile(file[0])) {
          // $('.page-bgimg').css('background-image', 'url(\"' + e.target.result + '\")');
          var $img = $('.page-bgimg');
          $img.attr('src', e.target.result);
          $img.css('display', 'block');
        }
      }
      reader.readAsDataURL(file[0]);
    }
  });

  // 페이지 번호 스위치 연동
  $('#switch-line-margin').on('change', function () {
    var $input = $('#input-footer-pagenum');
    var $page_num = $('.page-num');

    if ($(this).is(':checked')){
      $input.removeAttr('disabled');
      $input.removeAttr('readonly');

      $page_num.css('display', 'inline');
    } else {
      $input.attr('disabled', true);
      $input.attr('readonly', true);

      $page_num.css('display', 'none');
    }
  });


  // 폰트 선택 연동
  $('input:radio[name="input-radio-font"]').on('change', function() {
    var $checked_item = $('input:radio[name="input-radio-font"]:checked');
    
    let $user_ts = $('.user-ts');
    let $contents = $('.ts-content');
    let $footer = $('.ts-footer');

    // style 전체 삭제
    if ($checked_item.val() == pretendard) {
      setFont(pretendard, $user_ts, $contents, $footer);
      clearFront(kopubBatang, $user_ts, $contents, $footer);

    } else if ($checked_item.val() == kopubBatang) {
      setFont(kopubBatang, $user_ts, $contents, $footer);
      clearFront(pretendard, $user_ts, $contents, $footer);
    }
  });
  
  function setFont(fontName, $user_ts, $contents, $footer) {
    $user_ts.addClass('ts-' + fontName);
    $contents.addClass('ts-' + fontName + '-text');
    $footer.addClass('ts-' + fontName + '-ft');
  }

  function clearFront(fontName, $user_ts, $contents, $footer) {
    $user_ts.removeClass('ts-' + fontName);
    $contents.removeClass('ts-' + fontName + '-text');
    $footer.removeClass('ts-' + fontName + '-ft');
  }


  // 배경 이미지 스위치 연동
  $('#switch-bgimage').on('change', function () {
    var $input = $('#input-image');
    var $img = $('.page-bgimg');

    if ($(this).is(':checked')){
      $input.removeAttr('disabled');

      // src가 비어있어서 block으로 만들지 않음 (자동 border 삭제)
      if ($img.attr('src') != null) {
        $img.css('display', 'block');
      }

    } else {
      $input.attr('disabled', true);
      $img.css('display', 'none');
    }
  });


  // 생성 버튼 누를시
  $('#btn-submit').on('click', function (e) { 

    $('#img-download')[0].style.display = 'block';

    // 생성된 page 삭제
    var $pages = $('#page-generate');
    $pages.empty();

    // 생성된 canvas 삭제
    var $canvases = $('#canvas-generate');
    $canvases.empty();

    // 생성된 download link 삭제
    var $link = $('#link-generate');
    $link.empty();


    // 꼬릿말 설정
    var $pagetemplate = $('#page-templates').find($('.page'));
    $pagetemplate.find($('.name-footer-left')).text(
      $('#input-footer-left').val()
    );
    $pagetemplate.find($('.name-footer-right')).text(
      $('#input-footer-right').val()
    );


    // 텍스트 가져오기
    var text = $('#input-ctn-text').val().split('\n');

    // 시작 페이지 번호 취득
    var pagenum = $('#input-footer-pagenum').val();

    var $currentPage;
    var newpage = true;
    var p_remain_text = "";

    var i = 0;
    while(i < text.length) {
      // console.log("★★★ "+ i +" 번째 단락 ★★★");

      // 새 페이지 생성
      if (newpage) {
        $currentPage = $pagetemplate.clone();
        $currentPage.appendTo('#page-generate');
  
        // 페이지 번호 설정
        $currentPage.find($('.name-page-num')).text(pagenum);
  
        newpage = false;
      }
      
      // 현재 페이지의 본문 취득
      var $contents = $currentPage.find($('.ts-content'));
      var p_user_text = text[i].trim();

      // 남은 문단이 있을 경우
      if (p_remain_text.length > 0) {
        p_user_text = p_remain_text;

        // 단락 삽입
        $('<p>', {
          text: p_user_text,
          class: "line-remain"
        }).appendTo($contents);

        // 남은 문단 초기화
        p_remain_text = "";

      // 새 문단
      } else {
        if (p_user_text === null || p_user_text === "") {
          // 이중 엔터 구현
          p_user_text = "　"
        }

        // 단락 삽입
        $('<p>', {
          text: p_user_text
        }).appendTo($contents);
      }

      
      // 현재 본문 사이즈 확인
      let scrollheight = $contents.prop('scrollHeight');
      let contentsheight = $contents.height();
  
      // console.log("첫 시행 scrollheight: " + scrollheight + " / contentsheight: " + contentsheight);

      // 스크롤이 발생 했을 때
      if (scrollheight > contentsheight) {
        var delete_p = false;
        
        // 글자 수만큼 반복
        var j = 0;
        for (j = 0; j < p_user_text.length; j++) {
 
          // 이중개행 때문이라면
          if (p_user_text == "　") {
    
            // 단락을 삭제하고 다음 페이지에 표시
            delete_p = true;
    
            i--;
            newpage = true;

            break;
          } 

          // 내용 재설정
          var p_user_text_delete = p_user_text.substr(0, (j + 1));
          $contents.find($('p:last-child')).text(p_user_text_delete);
  
          // 스크롤 재설정
          $contents.css('overflow', 'hidden');
          $contents.css('overflow', 'auto');
  
          // 재취득
          scrollheight = $contents.prop('scrollHeight');
          contentsheight = $contents.height();
  
          // console.log(j + " 시행 scrollheight: " + scrollheight + " / contentsheight: " + contentsheight);

          // 스크롤이 발생했을 때
          if (scrollheight > contentsheight) {

            // 첫 글자 일 때
            if (j == 0) {
              // console.log('★ 전 문자 삭제');

              // 단락을 삭제하고 다음 페이지에 표시
              delete_p = true;

            // 첫글자가 아닐 때
            } else {
              // console.log('★ 내용 재설정');

              // 내용 재설정
              p_user_text_delete = p_user_text.substr(0, j) + "　　　";
              $contents.find($('p:last-child')).text(p_user_text_delete);

              // 남은 글자 저장
              p_remain_text = p_user_text.substr(j, p_user_text.length);
              // console.log("남은 글자 : " + p_remain_text);
            }

            i--;
            newpage = true;

            break;
          }
        }
  
        // 단락을 삭제
        if (delete_p) {
          // console.log('★삭제된 단락: ' + text[i]);
          $contents.find($('p:last-child')).remove();
        }
      }

      // 표시를 위해 visible로 전환
      $contents.css('overflow', 'visible');

      // 페이지 번호 올리기
      if (newpage) {
        pagenum++;
      }

      // 다음 단락으로
      i++;
    }
    
    // 생성한 page만큼 canvas 생성
    $pages.children().each(function (index, page) { 
      html2canvas(page, {
        // scale: 3 (840*1185)
        // sacle: 4 (1120*1580)
        imageTimeout: 0,
        scale: 3,
        onclone: (cloneDoc) => {
          let img_download = cloneDoc.getElementById('img-download');
          img_download.style.visibility = 'visible';
        }
      }).then((canvas) => {
        $canvases.append(canvas);
      });
    });

    // 결과 화면 표시
    $('#main')[0].style.display = 'none';
    $('#result')[0].style.display = 'block';

    $('#img-download')[0].style.display = 'none';
  });

  
  function createDownloadLink() {
    let pagenum = $('#input-footer-pagenum').val();
    let $links = $('#link-generate');
    let $canvases = $('#canvas-generate');
    
    // 링크 클리어
    $links.empty();

    // 링크 생성
    for (let canvas of $canvases.children()) {
      let src = canvas.toDataURL('image/png');
      
      $('<a>', {
        target: "_blank",
        href: src,
        download: pagenum + '_' + src.split(',')[1].substr(0,15) + '.png'
      }).appendTo($links);

      pagenum++;
    }
  }


  // 한 장씩 다운로드
  $('#btn-save-singly').on('click', function (e) {
    let $links = $('#link-generate');

    // 링크 생성
    createDownloadLink();

    // 링크 클릭
    for (let download of $links.children()) {
      console.log('링크 클릭');
      download.click();
    }
  });


  // zip으로 다운로드
  $('#btn-save-zip').on('click', function (e) {
    let $links = $('#link-generate');
    
    var zip = new JSZip();

    // 링크 생성
    createDownloadLink()

    for (let link of $links.children()) {
      zip.file(link.download, urlToPromise(link.href), {binary:true});
    }
    
    zip.generateAsync({type:"base64"}).then(function(base64) {
      window.open("data:application/zip;base64," + base64, "_blank");
      window.focus();
    });
    
    // 클릭하기
    document.getElementById('link-download-zip').click();
  });


});