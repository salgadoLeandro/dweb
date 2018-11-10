$(() => {
    $('#file-table').load('http://localhost:4008/lista', () => {
        var trs = $('#file-table tr').length
        if (trs < 2) $('#file-table').hide()
    })
    
    $("#post-form").submit(function(event) {
        event.preventDefault()
        var filename = $('#ficheiro').val().split('\\').pop()
        var desc = $('#desc').val()
        var pDate = new Date(Date.now()).toJSON()
        var formData = new FormData(this)
        formData.append('postDate', pDate)
        $('#file-table tr:last').after('<tr><td><a href="/uploaded/' + filename + '">' + filename + '</a></td><td>' + desc + '</td><td>' + new Date(pDate).toDateString() + '</td></tr>')
        ajaxPost(formData)
    })

    function ajaxPost(formData) {
        $.ajax({
            type: 'POST',
            url: '/lista/guardar',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: p => alert(JSON.stringify(p)),
            error: e => {
                alert('Erro no post: ' + e)
                console.log('Erro no post: ' + e)
            }
        })
        $('#ficheiro').val('')
        $('#desc').val('')
        $('#file-table').show()
    }
})