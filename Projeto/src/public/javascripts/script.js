$(() => {
    var comment_level = -1;
    var comment_index = -1;

    $('#fname').keypress(function(e) {
        if (e.which == 64 || e.which == 35) { e.preventDefault(); }
        //             '@'              '#'
    });

    $('.answer').click(function() {
        $(this).closest('div.answerdiv').find('input').show();
    });

    $('.comment_box').click(function() {
        var cl = $(this).closest('div.answerdiv').find('label.comment_level').text();
        var ci = $(this).closest('div.answerdiv').find('label.comment_index').text();
        comment_level = cl ? cl : -1;
        comment_index = ci ? ci : -1;
    });

    $('.comment_box').keypress(function(e) {
        if (e.which == 13){
            var id = $(this).closest('div.divitem').find('label.item_id').text();
            var data = {
                'comment_level': comment_level,
                'timestamp': new Date(Date.now()).toJSON(),
                'text': $(this).val()
            }
            if (comment_index > -1)
                data['cindex'] = comment_index;
            $.ajax({
                type: 'PUT',
                url: '/api/items/'+id,
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: () => {
                    console.log('Success');
                    location.href = location.href;
                },
                error: e => {
                    console.log('Error: ' + e);
                    console.log('Error: ' + e);
                }
            });
        }
    });

    $('#type').change(function(val) {
        var type = $('#type').val();
        if (type == 'album') {
            $('#local').hide();
            $('#title').show();
        } else if (type == 'event') {
            $('#local').show();
            $('#title').show();
        } else {
            $('#local').hide();
            $('#title').hide();
        }
    });

    $('#searchbar').keypress(function(e) {
        if (e.which == 13) {
            e.preventDefault();
            var regex = /\#[^\s]*\b/gi;
            var searchbar = $('#searchbar').val();
            var url;
            var search;
            if (searchbar.indexOf('#') > -1) {
                url = '/item/search';
                var term = searchbar.match(regex)[0];
                search = $('<input>').attr('type', 'hidden').attr('name', 'hashtag').attr('id', 'tempS1').val(term);
            }
            else {
                url = '/user/search';
                var name;
                if (searchbar.indexOf('@') > -1) {
                    name = 'email';
                }
                else {
                    name = 'name';
                }
                search = $('<input>').attr('type', 'hidden').attr('name', name).attr('id', 'tempS2').val(searchbar);
            }
            $('#searchform').append(search);
            
            var page = $('<input>').attr('type', 'hidden').attr('name', 'page').attr('id', 'tempP').val('1');
            $('#searchform').append(page);

            $('#searchform').attr('action', url);

            //$('#searchbar').remove();
            
            $('#searchform').submit();
            $('#tempS1').remove();
            $('#tempS2').remove();
            $('#tempP').remove();
        }
    });

    $('a').click(function(e) {
        if ($(this).hasClass('download')) {
            e.preventDefault();
            e.stopPropagation();
            window.open($(this).attr('href'), '_blank');
        }
    });

    $('#submit').click(function () {
        var data = new FormData($('#form')[0]);
        data.append('date', new Date(Date.now()).toJSON());
        $.ajax({
            type: 'POST',
            enctype: 'multipart/form-data',
            url: '/api/items/',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            success: () => {
                $('#titlef').val('');
                $('#localf').val('');
                $('#text').val('');
                console.log('Success');
                location.href = location.href;
            },
            error: e => {
                console.log('Error: ' + e);
            }
        });
    });

    $('#submit_edit').click(function (e) {
        var serial = $('#editprofile').serializeArray();
        var data = {};
        serial.forEach(obj => {
            data[obj.name] = obj.value;
        });
        $.ajax({
            type: 'PUT',
            url: '/api/users/profile',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: () => {
                location.href = location.href;
            },
            error: e => {
                console.log('Error: ' + e);
            }
        });
    });

    $('#addfriend').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var tmp = $('#mainpage').attr('data-url').split('/');
        var id = tmp[tmp.length-1];
        $(this).hide();
        $.ajax({
            type: 'POST',
            url: '/api/users/request/' + id,
            success: () => {
                alert('Request sent');
                
            },
            error: e => {
                console.log('Error: ' + e);
            }
        });
    });

    $('.accept').click(function(e){
        handle_request($(this).attr('id'), true);
    });

    $('.refuse').click(function(e){
        handle_request($(this).attr('id'), false);
    });

    $('#header-click').click(function(e){
        location.href = '/user/';
    });
});

function handle_request(uid, resp) {
    var data = {
        user: uid,
        state: resp
    };
    $.ajax({
        type: 'POST',
        url: '/api/users/requests',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: () => {
            $('#div'+uid).hide();
            if ($('.fr-request:visible').length == 0) {
                $('.div-requests').html("<h4 align='center'> There's nothing here </h4>");
            }
        },
        error: e => {
            console.log('Error: ' + e);
        }
    });
};