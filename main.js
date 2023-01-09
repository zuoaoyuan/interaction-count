const MIN_DURATION_THRESHOLD = 16;

function $(selector) {
    return document.querySelector(selector);
}

function logEventsAndCount() {
    let lastTenEntries = [];
    let firstInteractionId;
    const log = $('#event-log');

    const getInteractionNumber = (entry) => {
        // This code is an estimate until proper interactionCount is supported.
        return Math.round((entry.interactionId - firstInteractionId) / 7) + 1;
    }

    const updateCountDisplay = () => {
        const interactionCountValueElement = $('#interaction-count-value');
        if (interactionCountValueElement.innerHTML != performance.interactionCount)
            interactionCountValueElement.innerHTML = performance.interactionCount;
    }

    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.interactionId || entry.name == 'touchstart') {
                if (!firstInteractionId && entry.interactionId) {
                    firstInteractionId = entry.interactionId;
                }
                const interactionNumber = entry.interactionId ? getInteractionNumber(entry) : 'N/A';
                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${interactionNumber}</td>
          <td>${entry.name}</td>
          <td class="value">${entry.duration}</td>
          <td class="value">
            <code>${new Date().toISOString().slice(11)}</code>
          </td>
        `;
                log.prepend(tr);
                updateCountDisplay();
            }
        }
    }).observe({ type: 'event', durationThreshold: MIN_DURATION_THRESHOLD });
}

function initialize() {

    const block = (blockingTime = 0) => {
        const blockingStart = performance.now();
        while (performance.now() < blockingStart + blockingTime) {
            // Block...
        }
    }

    // Initialize event listener blocking time.
    ['keydown', 'keyup', 'pointerdown', 'pointerup', 'click', 'touchstart'].forEach((type) => {
        addEventListener(type, (event) => { block(MIN_DURATION_THRESHOLD) }, { passive: true });
    });

    logEventsAndCount();
}

if (
    'PerformanceEventTiming' in self &&
    'interactionId' in PerformanceEventTiming.prototype
) {
    initialize();
} else {
    document.body.classList.add('unsupported');
    alert(
        [
            `Oops, this brower does not fully support the Event Timing API,`,
            `which is required for this demo.`,
        ].join(' ')
    );
}
