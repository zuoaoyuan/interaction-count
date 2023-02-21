function $(selector) {
    return document.querySelector(selector);
}

function logEventsAndCount() {
    let firstInteractionId;
    const log = $('#event-log');

    const getInteractionNumber = (entry) => {
        // This code is an estimate until proper interactionCount is supported.
        return Math.round((entry.interactionId - firstInteractionId) / 7) + 1;
    }

    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            // exclude non-related annoying noise events
            const entry_type_ignore_list = ["pointerenter", "pointerover", "pointerout", "pointerleave", "mouseover", "mouseout"];
            if (entry_type_ignore_list.includes(entry.name)) continue;

            if (!firstInteractionId && entry.interactionId) {
                firstInteractionId = entry.interactionId;
            }
            const interactionNumber = entry.interactionId ? getInteractionNumber(entry) : 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
          <td>${interactionNumber}</td>
          <td>${entry.name}</td>
          <td class="value">${entry.pointerId}</td>
          <td class="value">${entry.duration}</td>
          <td class="value">
            <code>${new Date().toISOString().slice(17, 23)}</code>
          </td>
        `;
            log.prepend(tr);
        }
    }).observe({ type: 'event', durationThreshold: 16 });
}

function initialize() {

    const block16 = () => {
        const blockingStart = performance.now();
        while (performance.now() < blockingStart + 16) {
            // Block...
        }
    }

    const updateHandlerState = () => {
        const shouldEnable = $('#enableHandlers').checked;
        const entry_type_add_listener_list = ['pointerdown', 'pointerup', 'pointercancel', 'click', 'touchstart', 'touchend', 'contextmenu', 'gotpointercapture', 'lostpointercapture', 'keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'compositionstart', 'compositionupdate', 'compositionend'];
        entry_type_add_listener_list.forEach((type) => {
            if (shouldEnable) {
                addEventListener(type, block16, { passive: true });
            }
            else {
                removeEventListener(type, block16, { passive: true });
            }
        });
    }

    const preventDefault = (event) => {
        event.preventDefault();
    }

    const updateTouchStartPreventDefault = () => {
        const shouldEnable = $('#touchStartPreventDefault').checked;
        if (shouldEnable) {
            addEventListener('touchstart', preventDefault, { passive: false });
        }
        else {
            removeEventListener('touchstart', preventDefault, { passive: false });
        }
    }

    const repeatCountDisplayUpdate = () => {
        const interactionCountValueElement = $('#interaction-count-value');
        if (interactionCountValueElement.innerHTML != performance.interactionCount) {
            interactionCountValueElement.innerHTML = performance.interactionCount;
        }
        setTimeout(repeatCountDisplayUpdate, 50);
    }

    // add config box handler
    $('#enableHandlers').addEventListener('click', updateHandlerState);
    $('#touchStartPreventDefault').addEventListener('click', updateTouchStartPreventDefault);

    logEventsAndCount();

    repeatCountDisplayUpdate();
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
