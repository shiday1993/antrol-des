function apiReq({ url, method = 'GET', data = {}, success, error }) {
    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        data: method === 'GET' ? null : JSON.stringify(data),
        success: function (result) {
            const meta = result.metaData || {};
            if (meta.code === '200') {
                if (typeof success === 'function') success(result.response, meta);
            } else {
                if (typeof error === 'function') error(result.response, meta);
            }
        },
        error: function (xhr, status, err) {
            console.error('Error:', err);
            try {
                const response = JSON.parse(xhr.responseText);
                if (typeof error === 'function') error(response.response, response.metaData);
            } catch (e) {
                console.error('Error: ' + err);
                if (typeof error === 'function') error({}, { code: '500', message: String(e) });
            }
        }
    });
}
