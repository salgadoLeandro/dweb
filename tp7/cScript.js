$(() => {
    $(document).ready(function() {
        var trs = $("#file-table tr").length
        if (trs < 2) {
            $('#header2').hide()
            $('#container2').hide()
        }
    })

    $("#post-form").submit(function(event) {
        var postDate = new Date(Date.now()).toJSON()
        $(this).prepend('<input type="hidden" name="date" value="' + postDate + '"/>')
        event.preventDefault()
        var filename = $('#ficheiro').val().split('\\').pop()
        var desc = $('#desc').val()
        $.ajax({
            url: '/',
            type: 'POST',
            data: new FormData(this),
            contentType: false,
            cache: false,
            processData: false,
            success: () => {
                $('#header2').show()
                $('#container2').show()
                $('#file-table tr:last').after('<tr><td><a href="/' + filename + '">' + filename + '</a></td><td>' + desc + '</td><td>' + new Date(postDate).toDateString() + '</td></tr>')
            }
        })
    })
})