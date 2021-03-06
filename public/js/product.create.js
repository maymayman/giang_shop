function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || '';
  sliceSize = sliceSize || 512;

  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

function getPathName(href) {
  const reg = /.+?\:\/\/.+?(\/.+?)(?:#|\?|$)/;
  const pathname = reg.exec(href)[1];

  return pathname.replace("'", '');
}

function validBase64(s) {
  return !!s.match(validBase64.regex);
}
validBase64.regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;


(function ($) {
  $(document).ready(function () {    
    $('.images .pic').on('click', function () {
      const uploader = $('<input type="file" accept="image/*" />');
      const images = $('.images');
      uploader.click();

      uploader.on('change', function () {
        const img_default = '<div class="img img-loading" style="background-image: url(\'' + '/img/Spinner-2.2s-200px.gif' + '\');" rel="'+ `/img/Spinner-2.2s-200px.gif`  +'"><span>remove</span></div>'
        images.prepend(img_default);
        const reader = new FileReader()
        reader.onload = function(event) {
          const image = new Image();
          image.src = event.target.result;
  
          image.onload = function() {
            // access image size here 
            const fileSize = 2 * 1024 * 1024;
            const ratio = this.height / this.width;
            const success = (1.3 < ratio && ratio < 1.35) ? true : false;
            
            $('.img-loading').remove();
            if (uploader[0].files[0].size > fileSize || !success) {
              alert(`INVALID IMAGE: size should less than ${fileSize} and ratio width/height should be 3/4 `)
            } else {
              images.prepend('<div class="img" style="background-image: url(\'' + event.target.result + '\');" rel="'+ event.target.result  +'"><span>remove</span></div>');
            }
          };          
        }
        reader.readAsDataURL(uploader[0].files[0]);
      });
      
      images.on('click', '.img', function () {
        $(this).remove();
      });
    });

    $('#colors').on('change', function () {
      if ($('#colors :selected').text() === 'NONE') {
        $('.descriptionColorClass').show();
      } else {
        $('.descriptionColorClass').hide();
      }
    })

    $('#send').on('click', function () {
      const $this = $(this);
      $this.attr('disabled', 'disabled');
      $this.addClass( 'bg-info progress-bar-striped progress-bar-animated');
      const images = $('.images .img');
      const form = document.getElementById('myForm');
      const formDataToUpload = new FormData(form);

      for(let i = 0; i < images.length; i++) {
        const ImageURL = $(images[i]).attr('rel');
        const block = ImageURL.split(';');
        // Get the content type of the image
        const contentType = block[0].split(':')[1];// In this case 'image/gif'
        // get the real base64 content of the file
        const realData = block[1].split(',')[1];// In this case "R0lGODlhPQBEAPeoAJosM...."

        // Convert it to a blob to upload
        const blob = b64toBlob(realData, contentType);

        // Create a FormData and append the file with "image" as parameter name
        formDataToUpload.append(`image${i}`, blob);
      }     
      
      $.ajax({
        url: '/admin/product/create',
        data: formDataToUpload,// the formData function is available in almost all new browsers.
        type:'POST',
        contentType:false,
        processData:false,
        cache:false,
        dataType:'json', // Change this according to your response from the server.
        beforeSend: function() {
          console.log('before');
        },
        error:function(err){
          $this.removeAttr('disabled', 'disabled');
          $this.removeClass( 'bg-info progress-bar-striped progress-bar-animated');
          alert(err);
        },
        success:function(data){
          console.log(data);
        },
        complete:function(response) {
          const { status, responseJSON } = response;
          console.log(status, responseJSON);
          $this.removeAttr('disabled', 'disabled');
          $this.removeClass( 'bg-info progress-bar-striped progress-bar-animated');
          if (status != 200 || !responseJSON || !responseJSON.success ) {
            alert(responseJSON.error);
          } else {
            console.log('Request finished.', response);
            window.location.replace('/admin/product?status=PENDING');
          }          
        }
      });
    });
    $('#crop').on('click', function () {
      $('#cropImage').modal('show');
    });

    $('.image-editor').cropit({
      width: 300,
      height: 400,
    });
    $('.select-image-btn').click(function() {
      $('.cropit-image-input').click();
    });
 
    $('.export').click(function() {
      const imageData = $('.image-editor').cropit('export', {
        originalSize: true
      });
      const images = $('.images');
      images.append('<div class="img" style="background-image: url(\'' + imageData + '\');" rel="'+ imageData  +'"><span>remove</span></div>');
      $('#cropImage').modal('hide');
    });

    $('.images').on('click', '.img', function () {
      $(this).remove();
    });

    $('.standardSelect').chosen({
      disable_search_threshold: 10,
      no_results_text: 'Oops, nothing found!',
      width: '100%'
    });

    $('#summernote').summernote({
      height: 350,
    });

    $('#summernote1').summernote({
      height: 350,
    });

    $('#Description').summernote({
      height: 350,
    });
    $('#shortDescription').summernote({
      height: 350,
    });

    $('#sendUpdate').on('click', function () {
      const $this = $(this);
      const objectId = $('.object-id').data('object-id');
      $this.attr('disabled', 'disabled');
      $this.addClass( 'bg-info progress-bar-striped progress-bar-animated');
      const images = $('.images .img');
      const form = document.getElementById('updateFrom');
      const formDataToUpload = new FormData(form);

      for(let i = 0; i < images.length; i++) {
        const ImageURL = $(images[i]).attr('rel');

        if (validBase64(ImageURL)) {
          const block = ImageURL.split(';');
          // Get the content type of the image
          const contentType = block[0].split(':')[1];// In this case 'image/gif'
          // get the real base64 content of the file
          const realData = block[1].split(',')[1];// In this case 'R0lGODlhPQBEAPeoAJosM....'

          // Convert it to a blob to upload
          const blob = b64toBlob(realData, contentType);

          // Create a FormData and append the file with 'image' as parameter name
          formDataToUpload.append(`image${i}`, blob);
        } else {
          const oldPath = getPathName(ImageURL);
          formDataToUpload.append('oldImages', oldPath);
        }        
      }
      
      $.ajax({
        url: '/admin/product/update/' + objectId,
        data: formDataToUpload,// the formData function is available in almost all new browsers.
        type:'POST',
        contentType:false,
        processData:false,
        cache:false,
        dataType:'json', // Change this according to your response from the server.
        beforeSend: function() {
          console.log('before');
        },
        error:function(err){
          $this.removeAttr('disabled', 'disabled');
          $this.removeClass( 'bg-info progress-bar-striped progress-bar-animated');
          alert(err);
        },
        success:function(data){
          console.log(data);
        },
        complete:function(response) {
          const { status, responseJSON } = response;
          $this.removeAttr('disabled', 'disabled');
          $this.removeClass( 'bg-info progress-bar-striped progress-bar-animated');
          if (status != 200 || !responseJSON || !responseJSON.success ) {
            alert(responseJSON.error);
          } else {
            console.log('Request finished.', response);
            window.location.replace('/admin/product?status=PENDING');
          }          
        }
      });
    });

    $('#size').change(function(){
      const value = this.value;
      let sizes = [];
      let html = '';
      if (value === 'numberSize') {
        sizes = [
          '35', '35,5', '36', '36,5', '37', '37,5', '38', '38,5', '39', '39,5', 
          '40', '40,5', '41', '41,5', '42', '42,5', '43', '43,5', '44'
        ];
      } else if (value === 'fontSize') {
        sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      }

      sizes.forEach(function(size) {
        html = html + `
          <label for="quantity-size-${size}" class=" form-control-label">Size - ${size} - Quantity</label>
          <input type="number" id="${size}" name="${size}" class="form-control" value=0>
        `;
      });

      $('.size-quantity').empty();
      $('.size-quantity').append(html);
    });
  });
})(jQuery);