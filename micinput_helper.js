
export default class MicInput_Helper {
    constructor() {        
    }
    /**
     * initialize the mic listener and return user the raw amplitude from mic.
     * @param {dom} object for listener. if none is given it will default to window.
     * @example
     * var micInput = new MicInput_Helper();
     * let contextOptions = {
     *  latencyHint: 0,
     *  sampleRate: 22050,
     * }
     * micInput.init(contextOptions,window);
     * or
     * micInput.init(document.body);
     * receiving side must apply;
     * 
     *  window.addEventListener('amplitudeChanged', (evt) => {
     *     console.log(`evt`, evt.detail.value);
     *     console.log(`evt`, evt.detail.raw);
     *  });
     */
    async init(contextOptions, dom) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        var audioContext;
        if (arguments.length == 0){
            audioContext = new AudioContext({latencyHint: 0}); 
        } else {
            audioContext = new AudioContext(contextOptions);
        }
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
            if (arguments.length > 1) {
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

