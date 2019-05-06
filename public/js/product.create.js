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
            console.log(this.width);
          };
          images.prepend('<div class="img" style="background-image: url(\'' + event.target.result + '\');" rel="'+ event.target.result  +'"><span>remove</span></div>');
          $('.img-loading').remove();
        }
        reader.readAsDataURL(uploader[0].files[0]);
      });
      
      images.on('click', '.img', function () {
        $(this).remove();
      });
    });

    $('#send').on('click', function () {
      const images = $('.images .img');
      const form = document.getElementById("myForm");
      const formDataToUpload = new FormData(form);

      for(let i = 0; i < images.length; i++) {
        const ImageURL = $(images[i]).attr('rel');
        const block = ImageURL.split(";");
        // Get the content type of the image
        const contentType = block[0].split(":")[1];// In this case "image/gif"
        // get the real base64 content of the file
        const realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."

        // Convert it to a blob to upload
        const blob = b64toBlob(realData, contentType);

        // Create a FormData and append the file with "image" as parameter name
        formDataToUpload.append(`image${i}`, blob);
      }     
      
      $.ajax({
        url: '/admin/product/create/test',
        data: formDataToUpload,// the formData function is available in almost all new browsers.
        type:"POST",
        contentType:false,
        processData:false,
        cache:false,
        dataType:"json", // Change this according to your response from the server.
        beforeSend: function() {
          console.log('before');
        },
        error:function(err){
          console.error(err);
        },
        success:function(data){
          console.log(data);
        },
        complete:function(response){
          console.log("Request finished.", response.responseJSON);
        }
      });
    })
  })
})(jQuery);