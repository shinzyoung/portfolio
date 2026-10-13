
var Amt = Amt || {};

Amt.createRepository = function ($namespace) {
    var parts = $namespace.split(".");
    var parent = Amt;
    var i;

    // 처음에 중복되는 전역 객체명은 제거한다.
    if(parts[0] === Amt)
    {
        parts = parts.slice(1);
    }

    for(i = 0; i < parts.length; ++i)
    {
        // 프로퍼티가 존재하지 않는다면 생성한다.
        if(typeof parent[parts[i]] === "undefined")
        {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }

    return parent;
};

Amt.createRepository("Util");

Amt.Util = (function ()
{
    var getGlobalOffset = function ($element)
    {
        var x = 0;
        var y = 0;

        do
        {
            x += $element.offsetLeft;
            y += $element.offsetTop;
        }
        while ($element = $element.offsetParent);

        return {
            x: x,
            y: y
        }
    }

    return {
        getGlobalOffset: getGlobalOffset
    }
}());