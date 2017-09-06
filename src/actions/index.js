export const updateAppSelected = (selected) => ({
    type: 'UPDATE_APP_SELECTED',
    selected
});
export const openAppStartEnd = (open, onFinish) => ({
    type: 'OPEN_APP_START_END',
    open,
    onFinish
});
export const openAppDate = (open, onFinish) => ({
    type: 'OPEN_APP_DATE',
    open,
    onFinish
});
export const updateAppPickerStartEndValue = (valueGroup) => ({
    type: 'UPDATE_APP_PICKER_START_END_VALUE',
    valueGroup
});
export const updateAppPickerDateValue = (valueGroup) => ({
    type: 'UPDATE_APP_PICKER_DATE_VALUE',
    valueGroup
});
export const updateAppIntro = (intro, introElement) => ({
    type: 'UPDATE_APP_INTRO',
    intro,
    introElement
});
export const updateAppOrderTrain= (train) => ({
    type: 'UPDATE_APP_ORDER_TRAIN',
    train
});
export const updateBusiTicket= (busiTicket) => ({
    type: 'UPDATE_BUSI_TICKET',
    busiTicket
});