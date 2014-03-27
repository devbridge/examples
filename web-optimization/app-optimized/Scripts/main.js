$(document).ready(function(){
    $('iframe').each(function() {
        $(this).attr('src', $(this).data('src'));
    });
});