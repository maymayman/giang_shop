(function ($) {
    jQuery(document).ready(function ($) {
        const fileSize = 5 * 1024 * 1024;

        var reader = new FileReader();


        reader.onload = function (e) {
            $('#blah').attr('src', e.target.result);
        }

        function readURL(input) {
            if (input.files && input.files[0] && input.files[0].size <= fileSize) {
                reader.readAsDataURL(input.files[0]);
            } else {
                alert("Image Invalid Size: " + input.files[0].size)
            }
        }


        $("#image").change(function () {
            const _URL = window.URL;
            let file, img;
            const _this = this;

            if ((file = _this.files[0])) {
                img = new Image();
                img.onload = function () {
                    if ((1200 < this.width)) {
                        readURL(_this);
                    } else {
                        alert('Image invalid' + "--Width: " + this.width + "   Height: " + this.height);
                        $("#image").val(null);
                    }
                };
                img.src = _URL.createObjectURL(file);
            }
        });
    });

    function submit() {
        document.getElementById("formBanner").submit();
    }
})(jQuery);