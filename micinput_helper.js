
export default class MicInput_Helper {
    constructor() {        
    }

    async onMicrophoneGranted(evt) {
        var audioContext;
        if (arguments.length == 0){
            audioContext = new AudioContext({latencyHint: 0}); 
        } else {
            audioContext = new AudioContext(this.contextOptions);
        }
        await audioContext.audioWorklet.addModule('vumeter-processor.js')
        let microphone = audioContext.createMediaStreamSource(this.stream);
        const node = new AudioWorkletNode(audioContext, 'vumeter');
        microphone.connect(node).connect(audioContext.destination);

        node.port.onmessage  = event => {
            let _volume = 0;
            let _sensibility = 2; // Just to add any sensibility 
            if (event.data.volume)
                _volume = event.data.volume;
            let rawAmp = ((_volume * 100) / _sensibility);
            if (this.dom) {
                this.dom.dispatchEvent(
                    new CustomEvent(
                        'amplitudeChanged',
                        {
                            detail: {
                                value: rawAmp,
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
                            }
                        }
                    )
                );
            }
        }
        
    }
    onMicrophoneDenied(evt) {
        console.log('User denied microphone. Restart the page again to request.')
    }
    /**
     * initialize the mic listener and return user the raw amplitude from mic.
     * make sure you must attached this mic init process within a onclick event for security policy.
     * @param {dom} object for listener. if none is given it will default to window.
     * @example
     * document.getElementById('someButtonId).addEventListener('click', (evt)=>{
     *  this.micInput = new MicInput_Helper();
     *  let contextOptions = {
     *      latencyHint: 0,
     *      sampleRate: 22050,
     *  }
     *  this.micInput.init(contextOptions, window); 
     * }));
     * then apply event listener;
     * 
     *  window.addEventListener('amplitudeChanged', (evt) => {
     *      let multiplier = 20000;
     *      if (evt.detail.value * multiplier) >= 50) {
     *          console.log(`evt`, evt.detail.value);
     *      }
     *  });
     */
    async init(contextOptions, dom) {
        try {
            if (arguments.length > 0) {
                this.contextOptions = contextOptions;
            }
            if (arguments.length > 1){
                this.dom = dom;
            }
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            await navigator.getUserMedia(
                { audio: true, video: false },
                (evt)=>{ this.onMicrophoneGranted(evt) },
                (err)=>{ this.onMicrophoneDenied(err) }
            );
            
        } catch(e) {
            console.log(e);
        }        
    }
    
};

