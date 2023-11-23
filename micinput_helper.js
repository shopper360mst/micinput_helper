
export default class MicInput_Helper {
    constructor() {        
    }
    /**
     * initialize the mic listener and return user the raw amplitude from mic.
     * @param {dom} object for listener. if none is given it will default to window.
     * @example
     * var micInput = new MicInput_Helper();
     * micInput.init(window);
     * or
     * micInput.init(document.body);
     * receiving side must apply;
     * 
     *  window.addEventListener('amplitudeChanged', (evt) => {
     *     console.log(`evt`, evt.detail.value);
     *     console.log(`evt`, evt.detail.raw);
     *  });
     */
    async init(dom) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const audioContext = new AudioContext();
        const mediaStreamAudioSourceNode = audioContext.createMediaStreamSource(stream);
        const analyserNode = audioContext.createAnalyser();
        mediaStreamAudioSourceNode.connect(analyserNode);

        const pcmData = new Float32Array(analyserNode.fftSize);
        const onFrame = () => {
            analyserNode.getFloatTimeDomainData(pcmData);
            let sumSquares = 0.0;
            for (const amplitude of pcmData) { sumSquares += amplitude*amplitude; }
            let rawAmp = Math.sqrt(sumSquares / pcmData.length) * 1000000;
            let rawPure = Math.sqrt(sumSquares / pcmData.length);
            if (arguments.length > 0) {
                dom.dispatchEvent(
                    new CustomEvent(
                        'amplitudeChanged',
                        {
                            detail: {
                                value: rawAmp,
                                raw : rawPure,
                            }
                        }
                    )
                );
            } else {
                window.dispatchEvent(
                    new CustomEvent(
                        'amplitudeChanged',
                        {
                            detail: {
                                value: rawAmp,
                                raw : rawPure,
                            }
                        }
                    )
                );
            }
            
            window.requestAnimationFrame(onFrame);
        };
        window.requestAnimationFrame(onFrame);
    }
    
};

