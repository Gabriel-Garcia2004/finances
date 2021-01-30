function startModal() {
    const close = document.querySelector('.js-closeModal')
    const modal = document.querySelector('.c-modal');

    modal.classList.add('js-is-active')
    modal.addEventListener('click', (e) => {
        if(e.target == modal || e.target == close) {
            setTimeout(function(){
                modal.classList.remove('js-is-active')
            }, 100)
        }
    });
};
    const openModal = document.querySelector('.js-new-transaction');
    openModal.addEventListener('click', () => startModal());