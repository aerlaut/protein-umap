// Required because react-vega still uses class components. Next-JS 13
// will try to render classes in server-component, which causes error
// https://nextjs.org/docs/messages/class-component-in-server-component

'use client'

import { useState, useEffect } from 'react';
import { Vega } from 'react-vega';
import { Handler } from 'vega-tooltip';


type UMAPData = {
    accession_id: string,
    UMAP_1: number,
    UMAP_2: number,
    annotation: string
}

interface UMAPProps {
    data: UMAPData[]
}

const specWithData = (data: UMAPData, width: number, height: number) => ({
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "description": "An interactive scatter plot example supporting pan and zoom.",
    "width": width,
    "height": height,
    "autosize": "pad",
    "padding": 5,
    "config": {
        "axis": {
            "domain": false,
            "ticks": false,
            "labels": false
        }
    },
    "data": [
        {
            "name": "points",
            "values": data,
            "transform": [
                {
                    "type": "extent",
                    "field": "UMAP_1",
                    "signal": "xext"
                },
                {
                    "type": "extent",
                    "field": "UMAP_2",
                    "signal": "yext"
                }
            ]
        },
        {
            "name": "base",
            "source": "points",
            "transform": [
                {
                    "type": "filter",
                    "expr": "!datum.annotation"
                }
            ]
        },
        {
            "name": "annotated",
            "source": "points",
            "transform": [
                {
                    "type": "filter",
                    "expr": "datum.annotation"
                }
            ]
        }
    ],
    "signals": [
        {
            "name": "margin",
            "value": 20
        },
        {
            "name": "hover",
            "on": [
                {
                    "events": "*:pointerover",
                    "encode": "hover"
                },
                {
                    "events": "*:pointerout",
                    "encode": "leave"
                },
            ]
        },
        {
            "name": "xoffset",
            "update": "-(height + padding.bottom)"
        },
        {
            "name": "yoffset",
            "update": "-(width + padding.left)"
        },
        {
            "name": "xrange",
            "update": "[0, width]"
        },
        {
            "name": "yrange",
            "update": "[height, 0]"
        },
        {
            "name": "down",
            "value": null,
            "on": [
                {
                    "events": "touchend",
                    "update": "null"
                },
                {
                    "events": "pointerdown, touchstart",
                    "update": "xy()"
                }
            ]
        },
        {
            "name": "xcur",
            "value": null,
            "on": [
                {
                    "events": "pointerdown, touchstart, touchend",
                    "update": "slice(xdom)"
                }
            ]
        },
        {
            "name": "ycur",
            "value": null,
            "on": [
                {
                    "events": "pointerdown, touchstart, touchend",
                    "update": "slice(ydom)"
                }
            ]
        },
        {
            "name": "delta",
            "value": [
                0,
                0
            ],
            "on": [
                {
                    "events": [
                        {
                            "source": "window",
                            "type": "pointermove",
                            "consume": true,
                            "between": [
                                {
                                    "type": "pointerdown"
                                },
                                {
                                    "source": "window",
                                    "type": "pointerup"
                                }
                            ]
                        },
                        {
                            "type": "touchmove",
                            "consume": true,
                            "filter": "event.touches.length === 1"
                        }
                    ],
                    "update": "down ? [down[0]-x(), y()-down[1]] : [0,0]"
                }
            ]
        },
        {
            "name": "anchor",
            "value": [
                0,
                0
            ],
            "on": [
                {
                    "events": "wheel",
                    "update": "[invert('xscale', x()), invert('yscale', y())]"
                },
                {
                    "events": {
                        "type": "touchstart",
                        "filter": "event.touches.length===2"
                    },
                    "update": "[(xdom[0] + xdom[1]) / 2, (ydom[0] + ydom[1]) / 2]"
                }
            ]
        },
        {
            "name": "zoom",
            "value": 1,
            "on": [
                {
                    "events": "wheel!",
                    "force": true,
                    "update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
                },
                {
                    "events": {
                        "signal": "dist2"
                    },
                    "force": true,
                    "update": "dist1 / dist2"
                }
            ]
        },
        {
            "name": "dist1",
            "value": 0,
            "on": [
                {
                    "events": {
                        "type": "touchstart",
                        "filter": "event.touches.length===2"
                    },
                    "update": "pinchDistance(event)"
                },
                {
                    "events": {
                        "signal": "dist2"
                    },
                    "update": "dist2"
                }
            ]
        },
        {
            "name": "dist2",
            "value": 0,
            "on": [
                {
                    "events": {
                        "type": "touchmove",
                        "consume": true,
                        "filter": "event.touches.length===2"
                    },
                    "update": "pinchDistance(event)"
                }
            ]
        },
        {
            "name": "xdom",
            "update": "slice(xext)",
            "on": [
                {
                    "events": {
                        "signal": "delta"
                    },
                    "update": "[xcur[0] + span(xcur) * delta[0] / width, xcur[1] + span(xcur) * delta[0] / width]"
                },
                {
                    "events": {
                        "signal": "zoom"
                    },
                    "update": "[anchor[0] + (xdom[0] - anchor[0]) * zoom, anchor[0] + (xdom[1] - anchor[0]) * zoom]"
                }
            ]
        },
        {
            "name": "ydom",
            "update": "slice(yext)",
            "on": [
                {
                    "events": {
                        "signal": "delta"
                    },
                    "update": "[ycur[0] + span(ycur) * delta[1] / height, ycur[1] + span(ycur) * delta[1] / height]"
                },
                {
                    "events": {
                        "signal": "zoom"
                    },
                    "update": "[anchor[1] + (ydom[0] - anchor[1]) * zoom, anchor[1] + (ydom[1] - anchor[1]) * zoom]"
                }
            ]
        },
        {
            "name": "size",
            "update": "clamp(200 / span(xdom), 50, 1000)"
        }
    ],
    "scales": [
        {
            "name": "xscale",
            "zero": false,
            "domain": {
                "signal": "xdom"
            },
            "range": {
                "signal": "xrange"
            }
        },
        {
            "name": "yscale",
            "zero": false,
            "domain": {
                "signal": "ydom"
            },
            "range": {
                "signal": "yrange"
            }
        },
        {
            "name": "annotationColor",
            "type": "ordinal",
            "domain": {"data": "annotated", "field": "annotation"},
            "range": {"scheme": "tableau10"}
        },
    ],
    "axes": [
        {
            "scale": "xscale",
            "orient": "top",
            "offset": {
                "signal": "xoffset"
            }
        },
        {
            "scale": "yscale",
            "orient": "right",
            "offset": {
                "signal": "yoffset"
            }
        }
    ],
    "marks": [
        {
            "type": "symbol",
            "from": {
                "data": "base"
            },
            "clip": true,
            "encode": {
                "update": {
                    "x": {
                        "scale": "xscale",
                        "field": "UMAP_1"
                    },
                    "y": {
                        "scale": "yscale",
                        "field": "UMAP_2"
                    },
                    "fill": {
                        "value": "#EFEFEF",
                    }
                },
            }
        },
        {
            "type": "symbol",
            "from": {
                "data": "annotated"
            },
            "clip": true,
            "encode": {
                "enter": {
                    "tooltip": {"signal": "datum.annotation ? { 'UniProtID' : datum.accession_id, 'Annotation' : datum.annotation } : '' "}
                },
                "update": {
                    "x": {
                        "scale": "xscale",
                        "field": "UMAP_1"
                    },
                    "y": {
                        "scale": "yscale",
                        "field": "UMAP_2"
                    },
                    "fill": {
                        "field": "annotation",
                        "scale": "annotationColor"
                    }
                },
            }
        }
    ],
})

export default function UMAP({ data } : UMAPProps) {

    // Detect if code is run client or server-side
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);

    const tooltip = new Handler()

    return (
        // @ts-ignore
        isClient && data && <Vega mode='vega' spec={specWithData(data, screen.availWidth, screen.availHeight)} tooltip={tooltip.call} />
    )
}