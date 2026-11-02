function LeNet() {

    // ============================================================
    // Canvas
    // ============================================================

    var w = window.innerWidth;
    var h = window.innerHeight;

    var svg = d3.select("#graph-container")
        .append("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg");

    var g = svg.append("g");

    svg.style("cursor", "move");


    // ============================================================
    // Style
    // ============================================================

    var color1 = "#e0e0e0";
    var color2 = "#a0a0a0";

    var borderWidth = 1.0;
    var borderColor = "black";
    var rectOpacity = 0.8;

    var showLabels = true;

    var sqrtLength = false;
    var lengthScale = 100;


    // ============================================================
    // Ellipsis
    // ============================================================
    
    var DOT_RADIUS = 1.5;

    // 三个点彼此的斜向步长
    var DOT_DX = 4;
    var DOT_DY = 4;

    // 整体相对“间距中心”的微调
    var DOT_CENTER_OFFSET_X = -2;
    var DOT_CENTER_OFFSET_Y = 2;


    // ============================================================
    // Data
    // ============================================================

    var architecture = [];
    var architecture2 = [];

    var lenet = {};


    var rect;
    var dot;
    var conv;
    var link;
    var poly;
    var line;
    var text;
    var info;


    // ============================================================
    // Helpers
    // ============================================================

    function range(n) {

        n = Math.max(
            0,
            Math.floor(n)
        );

        return Array.from(
            { length: n },
            (_, i) => i
        );
    }


    function flatten(arrays) {

        return [].concat.apply(
            [],
            arrays
        );
    }


    function rand(min, max) {

        return (
            min
            +
            Math.random()
            *
            (max - min)
        );
    }


    function lengthFn(length) {

        if (sqrtLength) {

            return (
                Math.sqrt(length)
                *
                lengthScale
                /
                10
            );
        }

        return (
            length
            *
            lengthScale
            /
            100
        );
    }


    function textFn(layer) {

        if (typeof layer === "object") {

            return (
                layer.numberOfSquares
                +
                "@"
                +
                layer.squareHeight
                +
                "x"
                +
                layer.squareWidth
            );
        }

        return "1x" + layer;
    }


    // ============================================================
    // Layer parameters
    // ============================================================

    function isOmitted(layer) {

        return !!layer.omit;
    }


    function getStepX(layer) {

        return Number.isFinite(layer.stepX)
            ? Math.max(0, layer.stepX)
            : 8;
    }


    function getStepY(layer) {

        return Number.isFinite(layer.stepY)
            ? Math.max(0, layer.stepY)
            : 8;
    }


    function getGap(layer) {

        return Number.isFinite(layer.gap)
            ? Math.max(0, layer.gap)
            : 30;
    }


    function getBoxWidth(layer) {

        return Number.isFinite(layer.boxWidth)
            ? Math.max(1, layer.boxWidth)
            : layer.squareWidth;
    }


    function getBoxHeight(layer) {

        return Number.isFinite(layer.boxHeight)
            ? Math.max(1, layer.boxHeight)
            : layer.squareHeight;
    }


    function topCount(layer) {

        var total = Math.max(
            0,
            Math.floor(
                layer.numberOfSquares
            )
        );


        var n = Number.isFinite(
            layer.topCount
        )
            ? Math.floor(layer.topCount)
            : 3;


        return Math.max(
            0,
            Math.min(
                n,
                total
            )
        );
    }


    function bottomCount(layer) {

        var total = Math.max(
            0,
            Math.floor(
                layer.numberOfSquares
            )
        );


        var available = Math.max(
            0,
            total - topCount(layer)
        );


        var n = Number.isFinite(
            layer.bottomCount
        )
            ? Math.floor(layer.bottomCount)
            : 8;


        return Math.max(
            0,
            Math.min(
                n,
                available
            )
        );
    }


    // ============================================================
    // Omission lower group
    // ============================================================

    function bottomStartX(layer) {

        return (
            topCount(layer)
            *
            getStepX(layer)
            +
            getGap(layer)
        );
    }


    function bottomStartY(layer) {

        return (
            topCount(layer)
            *
            getStepY(layer)
            +
            getGap(layer)
        );
    }


    // ============================================================
    // Last visible rectangle
    // ============================================================

    function lastOffsetX(layer) {

        if (!isOmitted(layer)) {

            return (
                Math.max(
                    0,
                    layer.numberOfSquares - 1
                )
                *
                getStepX(layer)
            );
        }


        if (bottomCount(layer) > 0) {

            return (
                bottomStartX(layer)
                +
                (
                    bottomCount(layer) - 1
                )
                *
                getStepX(layer)
            );
        }


        return (
            Math.max(
                0,
                topCount(layer) - 1
            )
            *
            getStepX(layer)
        );
    }


    function lastOffsetY(layer) {

        if (!isOmitted(layer)) {

            return (
                Math.max(
                    0,
                    layer.numberOfSquares - 1
                )
                *
                getStepY(layer)
            );
        }


        if (bottomCount(layer) > 0) {

            return (
                bottomStartY(layer)
                +
                (
                    bottomCount(layer) - 1
                )
                *
                getStepY(layer)
            );
        }


        return (
            Math.max(
                0,
                topCount(layer) - 1
            )
            *
            getStepY(layer)
        );
    }


    function layerVisualWidth(layer) {

        return (
            lastOffsetX(layer)
            +
            getBoxWidth(layer)
        );
    }


    function layerVisualHeight(layer) {

        return (
            lastOffsetY(layer)
            +
            getBoxHeight(layer)
        );
    }


    // ============================================================
    // Rectangles
    // ============================================================

    function buildRectsForLayer(
        layer,
        layerIndex
    ) {

        var total = Math.max(
            0,
            Math.floor(
                layer.numberOfSquares
            )
        );


        function makeRect(
            offsetX,
            offsetY,
            realIndex,
            visualIndex
        ) {

            return {

                id:
                    layerIndex
                    +
                    "_"
                    +
                    visualIndex,

                layer:
                    layerIndex,

                rect_index:
                    realIndex,

                offsetX:
                    offsetX,

                offsetY:
                    offsetY,

                width:
                    getBoxWidth(layer),

                height:
                    getBoxHeight(layer)
            };
        }


        // ========================================================
        // Normal mode
        // ========================================================

        if (!isOmitted(layer)) {

            return range(total)
                .map(function (i) {

                    return makeRect(

                        i
                        *
                        getStepX(layer),

                        i
                        *
                        getStepY(layer),

                        i,

                        i
                    );
                });
        }


        // ========================================================
        // Top
        // ========================================================

        var top = topCount(layer);
        var bottom = bottomCount(layer);


        var upper = range(top)
            .map(function (i) {

                return makeRect(

                    i
                    *
                    getStepX(layer),

                    i
                    *
                    getStepY(layer),

                    i,

                    i
                );
            });


        // ========================================================
        // Bottom
        // ========================================================

        var realStart =
            total - bottom;


        var startX =
            bottomStartX(layer);


        var startY =
            bottomStartY(layer);


        var lower =
            range(bottom)

                .map(function (i) {

                    return makeRect(

                        startX
                        +
                        i
                        *
                        getStepX(layer),

                        startY
                        +
                        i
                        *
                        getStepY(layer),

                        realStart
                        +
                        i,

                        top
                        +
                        i
                    );
                });


        return upper.concat(lower);
    }


    // ============================================================
    // Three fixed dots
    // ============================================================

    function buildDotsForLayer(
        layer,
        layerIndex
    ) {

        if (!isOmitted(layer)) {

            return [];
        }


        return [0, 1, 2]

            .map(function (i) {

                return {

                    layer:
                        layerIndex,

                    dot_index:
                        i,

                    r:
                        DOT_RADIUS
                };
            });
    }


    // ============================================================
    // Redraw
    // ============================================================

    function redraw({

        architecture_ = architecture,

        architecture2_ = architecture2,

        sqrtLength_ = sqrtLength,

        lengthScale_ = lengthScale

    } = {}) {


        architecture =
            architecture_;


        architecture2 =
            architecture2_;


        sqrtLength =
            sqrtLength_;


        lengthScale =
            lengthScale_;


        // ========================================================
        // Rects
        // ========================================================

        lenet.rects = flatten(

            architecture.map(

                function (
                    layer,
                    index
                ) {

                    return buildRectsForLayer(
                        layer,
                        index
                    );
                }
            )
        );


        // ========================================================
        // Dots
        // ========================================================

        lenet.dots = flatten(

            architecture.map(

                function (
                    layer,
                    index
                ) {

                    return buildDotsForLayer(
                        layer,
                        index
                    );
                }
            )
        );


        // ========================================================
        // Convolution filter
        // ========================================================

        lenet.convs =
            architecture.map(

                function (
                    layer,
                    index
                ) {

                    return Object.assign(

                        {
                            layer:
                                index
                        },

                        layer
                    );
                }
            );


        lenet.convs.pop();


        lenet.convs =
            lenet.convs.map(

                function (d) {

                    return Object.assign(

                        {

                            x_rel:
                                rand(
                                    0.15,
                                    0.75
                                ),

                            y_rel:
                                rand(
                                    0.15,
                                    0.75
                                )
                        },

                        d
                    );
                }
            );


        // ========================================================
        // CNN connections
        // ========================================================

        lenet.conv_links = flatten(

            lenet.convs.map(

                function (d) {

                    return [

                        Object.assign(
                            {
                                side:
                                    "upper"
                            },
                            d
                        ),

                        Object.assign(
                            {
                                side:
                                    "lower"
                            },
                            d
                        )
                    ];
                }
            )
        );


        // ========================================================
        // FC polygons
        // ========================================================

        lenet.fc_layers =
            architecture2.map(

                function (
                    size,
                    index
                ) {

                    return {

                        layer:
                            architecture.length
                            +
                            index,

                        fc_index:
                            index,

                        size:
                            lengthFn(size),

                        rawSize:
                            size
                    };
                }
            );


        // ========================================================
        // FC connections
        // ========================================================

        lenet.fc_links = flatten(

            lenet.fc_layers.map(

                function (fc) {

                    return [

                        {
                            fc_index:
                                fc.fc_index,

                            side:
                                "upper"
                        },

                        {
                            fc_index:
                                fc.fc_index,

                            side:
                                "lower"
                        }
                    ];
                }
            )
        );


        // ========================================================
        // Labels
        // ========================================================

        var labels =
            architecture.map(

                function (
                    layer,
                    index
                ) {

                    return {

                        layer:
                            index,

                        text:
                            textFn(layer)
                    };
                }
            )

            .concat(

                architecture2.map(

                    function (
                        layer,
                        index
                    ) {

                        return {

                            layer:
                                architecture.length
                                +
                                index,

                            text:
                                textFn(layer)
                        };
                    }
                )
            );


        // ========================================================
        // Clear
        // ========================================================

        g.selectAll("*").remove();


        // ========================================================
        // Feature maps
        // ========================================================

        rect =
            g.selectAll(".rect")

                .data(
                    lenet.rects
                )

                .enter()

                .append("rect")

                .attr(
                    "class",
                    "rect"
                )

                .attr(
                    "width",
                    d => d.width
                )

                .attr(
                    "height",
                    d => d.height
                );


        // ========================================================
        // Dots
        // ========================================================

        dot =
            g.selectAll(".dot")

                .data(
                    lenet.dots
                )

                .enter()

                .append("circle")

                .attr(
                    "class",
                    "dot"
                )

                .attr(
                    "r",
                    d => d.r
                );


        // ========================================================
        // Filter
        // ========================================================

        conv =
            g.selectAll(".conv")

                .data(
                    lenet.convs
                )

                .enter()

                .append("rect")

                .attr(
                    "class",
                    "conv"
                )

                .attr(
                    "width",
                    d => d.filterWidth
                )

                .attr(
                    "height",
                    d => d.filterHeight
                )

                .style(
                    "fill",
                    "none"
                );


        // ========================================================
        // CNN link
        // ========================================================

        link =
            g.selectAll(".link")

                .data(
                    lenet.conv_links
                )

                .enter()

                .append("line")

                .attr(
                    "class",
                    "link"
                );


        // ========================================================
        // FC polygon
        // ========================================================

        poly =
            g.selectAll(".poly")

                .data(
                    lenet.fc_layers
                )

                .enter()

                .append("polygon")

                .attr(
                    "class",
                    "poly"
                );


        // ========================================================
        // FC links
        // ========================================================

        line =
            g.selectAll(".line")

                .data(
                    lenet.fc_links
                )

                .enter()

                .append("line")

                .attr(
                    "class",
                    "line"
                );


        // ========================================================
        // Op
        // ========================================================

        text =
            g.selectAll(".text")

                .data(
                    architecture
                )

                .enter()

                .append("text")

                .attr(
                    "class",
                    "text"
                )

                .attr(
                    "dy",
                    ".35em"
                )

                .style(
                    "font-size",
                    "16px"
                )

                .attr(
                    "font-family",
                    "sans-serif"
                );


        // ========================================================
        // Info
        // ========================================================

        info =
            g.selectAll(".info")

                .data(
                    labels
                )

                .enter()

                .append("text")

                .attr(
                    "class",
                    "info"
                )

                .attr(
                    "dy",
                    "-0.3em"
                )

                .style(
                    "font-size",
                    "16px"
                )

                .attr(
                    "font-family",
                    "sans-serif"
                );


        style();
    }


    // ============================================================
    // Position
    // ============================================================

    function redistribute() {


        // ========================================================
        // Dimensions
        // ========================================================

        var cnnWidths =
            architecture.map(
                layerVisualWidth
            );


        var cnnHeights =
            architecture.map(
                layerVisualHeight
            );


        var fcWidths =
            lenet.fc_layers.map(

                function (d) {

                    return (
                        d.size
                        +
                        10
                    );
                }
            );


        var fcHeights =
            lenet.fc_layers.map(

                function (d) {

                    return d.size;
                }
            );


        var allWidths =
            cnnWidths.concat(
                fcWidths
            );


        var allHeights =
            cnnHeights.concat(
                fcHeights
            );


        var maxHeight =

            allHeights.length

                ?

                Math.max.apply(
                    null,
                    allHeights
                )

                :

                0;


        // ========================================================
        // Horizontal layout
        // ========================================================

        var xOffsets = [];

        var cursor = 0;


        architecture.forEach(

            function (
                layer,
                i
            ) {

                xOffsets.push(
                    cursor
                );


                cursor +=
                    cnnWidths[i]
                    +
                    (
                        Number.isFinite(
                            layer.layerSpace
                        )
                            ?
                            layer.layerSpace
                            :
                            70
                    );
            }
        );


        lenet.fc_layers.forEach(

            function (
                fc,
                i
            ) {

                xOffsets.push(
                    cursor
                );


                cursor +=
                    fcWidths[i]
                    +
                    50;
            }
        );


        var totalWidth =
            Math.max(
                1,
                cursor
            );


        var screenX =
            w / 2
            -
            totalWidth / 2;


        var screenY =
            h / 2
            -
            maxHeight / 2;


        // ========================================================
        // Vertical centering
        // ========================================================

        var yOffsets =
            allHeights.map(

                function (height) {

                    return (
                        maxHeight
                        -
                        height
                    )
                    /
                    2;
                }
            );


        function baseX(index) {

            return (
                screenX
                +
                xOffsets[index]
            );
        }


        function baseY(index) {

            return (
                screenY
                +
                yOffsets[index]
            );
        }


        // ========================================================
        // Rect positions
        // ========================================================

        rect

            .attr(
                "x",
                d =>
                    baseX(d.layer)
                    +
                    d.offsetX
            )

            .attr(
                "y",
                d =>
                    baseY(d.layer)
                    +
                    d.offsetY
            );


        // ========================================================
        // Ellipsis dots
        // ========================================================

        dot
            .attr(
                "cx",
                function (d) {

                    var layer =
                        architecture[d.layer];

                    var bottomX =
                        baseX(d.layer)
                        +
                        bottomStartX(layer);

                    var startX =
                        bottomX
                        -
                        getBoxWidth(layer) / 2;

                    return (
                        startX
                        +
                        d.dot_index * DOT_DX
                    );
                }
            )

            .attr(
                "cy",
                function (d) {

                    var layer =
                        architecture[d.layer];

                    var bottomY =
                        baseY(d.layer)
                        +
                        bottomStartY(layer);

                    var startY =
                        bottomY
                        +
                        getBoxHeight(layer)
                        -
                        getBoxHeight(layer) / 2;

                    return (
                        startY
                        +
                        d.dot_index * DOT_DY
                    );
                }
            );
        // ==================================================
        // Convolution filter coordinates
        // ========================================================

        function filterX(d) {

            var layer =
                architecture[
                    d.layer
                ];


            return (
                baseX(d.layer)
                +
                lastOffsetX(layer)
                +
                d.x_rel
                *
                (
                    getBoxWidth(layer)
                    -
                    d.filterWidth
                )
            );
        }


        function filterY(d) {

            var layer =
                architecture[
                    d.layer
                ];


            return (
                baseY(d.layer)
                +
                lastOffsetY(layer)
                +
                d.y_rel
                *
                (
                    getBoxHeight(layer)
                    -
                    d.filterHeight
                )
            );
        }


        conv

            .attr(
                "x",
                filterX
            )

            .attr(
                "y",
                filterY
            );


        // ========================================================
        // CNN -> CNN
        //
        // 精确从 filter box 右上 / 右下角出发
        // ========================================================

        link

            .attr(
                "x1",
                function (d) {

                    return (
                        filterX(d)
                        +
                        d.filterWidth
                    );
                }
            )

            .attr(
                "y1",
                function (d) {

                    return d.side === "upper"

                        ?

                        filterY(d)

                        :

                        filterY(d)
                        +
                        d.filterHeight;
                }
            )

            .attr(
                "x2",
                function (d) {

                    var next =
                        architecture[
                            d.layer + 1
                        ];


                    return (
                        baseX(
                            d.layer + 1
                        )
                        +
                        lastOffsetX(next)
                        +
                        d.x_rel
                        *
                        getBoxWidth(next)
                    );
                }
            )

            .attr(
                "y2",
                function (d) {

                    var next =
                        architecture[
                            d.layer + 1
                        ];


                    return (
                        baseY(
                            d.layer + 1
                        )
                        +
                        lastOffsetY(next)
                        +
                        d.y_rel
                        *
                        getBoxHeight(next)
                    );
                }
            );


        // ========================================================
        // FC corners
        // ========================================================

        function fcCorners(fcIndex) {


            var layerIndex =
                architecture.length
                +
                fcIndex;


            var fc =
                lenet.fc_layers[
                    fcIndex
                ];


            var x =
                baseX(
                    layerIndex
                );


            var y =
                baseY(
                    layerIndex
                );


            var s =
                fc.size;


            return {

                LU: {
                    x: x,
                    y: y
                },

                RU: {
                    x:
                        x + 10,

                    y:
                        y
                },

                RL: {
                    x:
                        x
                        +
                        s
                        +
                        10,

                    y:
                        y
                        +
                        s
                },

                LL: {
                    x:
                        x
                        +
                        s,

                    y:
                        y
                        +
                        s
                }
            };
        }


        // ========================================================
        // FC polygons
        // ========================================================

        poly.attr(

            "points",

            function (d) {

                var c =
                    fcCorners(
                        d.fc_index
                    );


                return (

                    c.LU.x
                    +
                    ","
                    +
                    c.LU.y

                    +
                    " "

                    +

                    c.RU.x
                    +
                    ","
                    +
                    c.RU.y

                    +
                    " "

                    +

                    c.RL.x
                    +
                    ","
                    +
                    c.RL.y

                    +
                    " "

                    +

                    c.LL.x
                    +
                    ","
                    +
                    c.LL.y
                );
            }
        );


        // ========================================================
        // CNN output corners
        //
        // 重要：
        //
        // upper = 第一张可见 feature map 的右上角
        //
        // lower = 最后一张可见 feature map 的右下角
        //
        // 这才是论文图中的 Flatten 形状。
        // ========================================================

        function cnnOutputCorners() {

            if (
                architecture.length === 0
            ) {

                return null;
            }


            var index =
                architecture.length - 1;


            var layer =
                architecture[index];


            return {

                upper: {

                    x:
                        baseX(index)
                        +
                        getBoxWidth(layer),

                    y:
                        baseY(index)
                },


                lower: {

                    x:
                        baseX(index)
                        +
                        lastOffsetX(layer)
                        +
                        getBoxWidth(layer),

                    y:
                        baseY(index)
                        +
                        lastOffsetY(layer)
                        +
                        getBoxHeight(layer)
                }
            };
        }


        // ========================================================
        // CNN -> Flatten -> FC
        // ========================================================

        line

            .attr(
                "x1",
                function (d) {

                    // First FC

                    if (
                        d.fc_index === 0
                    ) {

                        var source =
                            cnnOutputCorners();


                        return d.side === "upper"

                            ?

                            source.upper.x

                            :

                            source.lower.x;
                    }


                    // Previous FC

                    var previous =
                        fcCorners(
                            d.fc_index - 1
                        );


                    return d.side === "upper"

                        ?

                        previous.RU.x

                        :

                        previous.RL.x;
                }
            )

            .attr(
                "y1",
                function (d) {

                    if (
                        d.fc_index === 0
                    ) {

                        var source =
                            cnnOutputCorners();


                        return d.side === "upper"

                            ?

                            source.upper.y

                            :

                            source.lower.y;
                    }


                    var previous =
                        fcCorners(
                            d.fc_index - 1
                        );


                    return d.side === "upper"

                        ?

                        previous.RU.y

                        :

                        previous.RL.y;
                }
            )

            .attr(
                "x2",
                function (d) {

                    var current =
                        fcCorners(
                            d.fc_index
                        );


                    return d.side === "upper"

                        ?

                        current.LU.x

                        :

                        current.LL.x;
                }
            )

            .attr(
                "y2",
                function (d) {

                    var current =
                        fcCorners(
                            d.fc_index
                        );


                    return d.side === "upper"

                        ?

                        current.LU.y

                        :

                        current.LL.y;
                }
            );


        // ========================================================
        // Op labels
        // ========================================================

        text

            .attr(
                "x",
                function (d) {

                    var right =
                        baseX(d.layer)
                        +
                        cnnWidths[
                            d.layer
                        ];


                    var next;


                    if (
                        d.layer + 1
                        <
                        architecture.length
                    ) {

                        next =
                            baseX(
                                d.layer + 1
                            );
                    }

                    else if (
                        lenet.fc_layers.length > 0
                    ) {

                        next =
                            baseX(
                                architecture.length
                            );
                    }

                    else {

                        next =
                            right;
                    }


                    return (
                        right + next
                    )
                    /
                    2;
                }
            )

            .attr(
                "y",
                screenY
                +
                maxHeight
                +
                40
            );


        // ========================================================
        // Layer labels
        // ========================================================

        info

            .attr(
                "x",
                d =>
                    baseX(
                        d.layer
                    )
            )

            .attr(
                "y",
                d =>
                    baseY(
                        d.layer
                    )
                    -
                    15
            );
    }


    // ============================================================
    // Style
    // ============================================================

    function style({

        color1_ = color1,

        color2_ = color2,

        borderWidth_ = borderWidth,

        rectOpacity_ = rectOpacity,

        showLabels_ = showLabels

    } = {}) {


        color1 =
            color1_;

        color2 =
            color2_;

        borderWidth =
            borderWidth_;

        rectOpacity =
            rectOpacity_;

        showLabels =
            showLabels_;


        if (rect) {

            rect

                .style(
                    "fill",
                    d =>
                        d.rect_index % 2
                            ?
                            color1
                            :
                            color2
                )

                .style(
                    "stroke",
                    borderColor
                )

                .style(
                    "stroke-width",
                    borderWidth
                )

                .style(
                    "opacity",
                    rectOpacity
                );
        }


        if (dot) {

            dot

                .style(
                    "fill",
                    borderColor
                )

                .style(
                    "stroke",
                    "none"
                )

                .style(
                    "opacity",
                    rectOpacity
                );
        }


        if (conv) {

            conv

                .style(
                    "stroke",
                    borderColor
                )

                .style(
                    "stroke-width",
                    borderWidth
                )

                .style(
                    "opacity",
                    1
                );
        }


        if (link) {

            link

                .style(
                    "stroke",
                    borderColor
                )

                .style(
                    "stroke-width",
                    borderWidth / 2
                )

                .style(
                    "stroke-linecap",
                    "square"
                )

                .style(
                    "opacity",
                    rectOpacity
                );
        }


        if (poly) {

            poly

                .style(
                    "fill",
                    color1
                )

                .style(
                    "stroke",
                    borderColor
                )

                .style(
                    "stroke-width",
                    borderWidth
                )

                .style(
                    "opacity",
                    rectOpacity
                );
        }


        if (line) {

            line

                .style(
                    "stroke",
                    borderColor
                )

                .style(
                    "stroke-width",
                    borderWidth / 2
                )

                .style(
                    "stroke-linecap",
                    "square"
                )

                .style(
                    "opacity",
                    rectOpacity
                );
        }


        if (text) {

            text.text(
                d =>
                    showLabels
                        ?
                        d.op
                        :
                        ""
            );
        }


        if (info) {

            info.text(
                d =>
                    showLabels
                        ?
                        d.text
                        :
                        ""
            );
        }
    }


    // ============================================================
    // Zoom
    // ============================================================

    svg.call(

        d3.zoom()

            .scaleExtent([
                0.25,
                8
            ])

            .on(
                "zoom",
                function () {

                    g.attr(
                        "transform",
                        d3.event.transform
                    );
                }
            )
    );


    // ============================================================
    // Resize
    // ============================================================

    function resize() {

        w =
            window.innerWidth;


        h =
            window.innerHeight;


        svg

            .attr(
                "width",
                w
            )

            .attr(
                "height",
                h
            );
    }


    d3.select(window)

        .on(
            "resize",
            resize
        );


    resize();


    return {

        redraw:
            redraw,

        redistribute:
            redistribute,

        style:
            style
    };
}