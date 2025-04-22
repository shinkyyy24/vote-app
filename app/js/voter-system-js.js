// Lưu trữ thông tin cuộc bầu cử hiện tại để theo dõi thay đổi
let currentElectionState = '';

// Retrieve data from localStorage
let election = JSON.parse(localStorage.getItem('election')) || {
    name: "",
    isCreated: false,
    isActive: false,
    hasEnded: false
};
let candidates = JSON.parse(localStorage.getItem('candidates')) || {};
let votes = JSON.parse(localStorage.getItem('votes')) || {};

let selectedCandidateId = null;
let anonymousVoteId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    const submitVoteBtn = document.getElementById('submit-vote');
    submitVoteBtn.addEventListener('click', submitVote);
    
    // Khởi tạo trạng thái cuộc bầu cử hiện tại
    currentElectionState = JSON.stringify({
        name: election.name,
        isActive: election.isActive,
        hasEnded: election.hasEnded
    });
    
    // Display election information
    displayElectionInfo();
    
    // Display candidates for voting if election is active
    if (election.isActive) {
        displayCandidatesForVoting();
    } else {
        document.getElementById('election-closed-message').classList.remove('hidden');
        document.getElementById('candidates-container').classList.add('hidden');
    }
    
    // Generate anonymous vote ID
    generateAnonymousVoteId();
    
    // Thiết lập kiểm tra định kỳ cho cuộc bầu cử mới
    setInterval(checkForElectionChanges, 5000); // Kiểm tra mỗi 5 giây
});

function checkForElectionChanges() {
    // Lấy dữ liệu mới nhất từ localStorage
    const freshElection = JSON.parse(localStorage.getItem('election')) || {
        name: "",
        isCreated: false,
        isActive: false,
        hasEnded: false
    };
    
    // Tạo chuỗi trạng thái mới để so sánh
    const newElectionState = JSON.stringify({
        name: freshElection.name,
        isActive: freshElection.isActive,
        hasEnded: freshElection.hasEnded
    });
    
    // Nếu trạng thái đã thay đổi, làm mới trang
    if (newElectionState !== currentElectionState) {
        console.log("Phát hiện thay đổi trong cuộc bầu cử! Đang làm mới...");
        location.reload();
    }
}

function displayElectionInfo() {
    // Display election name
    document.getElementById('election-name-display').textContent = election.name || 'Chưa có cuộc bầu cử';
    
    // Display election status
    const statusElement = document.getElementById('election-status');
    if (election.isActive) {
        statusElement.textContent = 'Trạng thái: Đang diễn ra';
        statusElement.style.color = '#3c763d';
    } else if (election.hasEnded) {
        statusElement.textContent = 'Trạng thái: Đã kết thúc';
        statusElement.style.color = '#a94442';
    } else {
        statusElement.textContent = 'Trạng thái: Chưa bắt đầu';
        statusElement.style.color = '#31708f';
    }
}

function generateAnonymousVoteId() {
    // Generate a random string to use as anonymous vote ID
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    
    // Add timestamp to make it more unique
    anonymousVoteId = result + '_' + new Date().getTime();
}

function displayCandidatesForVoting() {
    const candidatesList = document.getElementById('candidates-list');
    candidatesList.innerHTML = '';
    
    if (Object.keys(candidates).length === 0) {
        candidatesList.innerHTML = '<p>Không có ứng cử viên nào.</p>';
        document.getElementById('submit-vote').disabled = true;
        return;
    }
    
    Object.values(candidates).forEach(candidate => {
        const card = document.createElement('div');
        card.className = 'voting-card';
        card.setAttribute('data-id', candidate.id);
        card.innerHTML = `
            <h3>${candidate.name}</h3>
            <p>Đảng: ${candidate.party}</p>
        `;
        
        card.addEventListener('click', function() {
            document.querySelectorAll('.voting-card').forEach(c => {
                c.classList.remove('selected');
            });
            this.classList.add('selected');
            selectedCandidateId = candidate.id;
        });
        
        candidatesList.appendChild(card);
    });
}

function submitVote() {
    if (!selectedCandidateId) {
        showAlert(document.getElementById('vote-alert'), 'Vui lòng chọn một ứng cử viên!', 'danger');
        return;
    }
    
    // Record the vote using anonymous ID
    votes[anonymousVoteId] = selectedCandidateId;
    
    // Increment candidate votes
    candidates[selectedCandidateId].votes = (candidates[selectedCandidateId].votes || 0) + 1;
    
    // Save changes to localStorage
    localStorage.setItem('votes', JSON.stringify(votes));
    localStorage.setItem('candidates', JSON.stringify(candidates));
    
    // Display success message
    showAlert(document.getElementById('vote-alert'), 'Phiếu bầu của bạn đã được ghi nhận!', 'success');
    
    // Disable vote button and candidate selection
    document.getElementById('submit-vote').disabled = true;
    document.querySelectorAll('.voting-card').forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.7';
    });
    
    // Tạo nút để xem kết quả
    const resultsButton = document.createElement('button');
    resultsButton.textContent = 'Xem kết quả';
    resultsButton.style.marginTop = '15px';
    resultsButton.style.marginLeft = '10px';
    resultsButton.addEventListener('click', function() {
        window.location.href = 'results.html';
    });
    
    // Thêm nút vào cạnh nút bỏ phiếu
    document.getElementById('submit-vote').parentNode.appendChild(resultsButton);
    
    // Tạo nút để bỏ phiếu lại
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Bỏ phiếu lại';
    resetButton.style.marginTop = '15px';
    resetButton.style.marginLeft = '10px';
    resetButton.style.backgroundColor = '#6c757d';
    resetButton.addEventListener('click', function() {
        resetVotingInterface();
    });
    
    // Thêm nút vào cạnh nút bỏ phiếu
    document.getElementById('submit-vote').parentNode.appendChild(resetButton);
}

function resetVotingInterface() {
    // Xóa lựa chọn ứng cử viên
    selectedCandidateId = null;
    document.querySelectorAll('.voting-card').forEach(card => {
        card.classList.remove('selected');
        card.style.pointerEvents = '';
        card.style.opacity = '';
    });
    
    // Kích hoạt lại nút bỏ phiếu
    document.getElementById('submit-vote').disabled = false;
    
    // Xóa thông báo
    document.getElementById('vote-alert').classList.add('hidden');
    
    // Xóa các nút bổ sung
    const parentElement = document.getElementById('submit-vote').parentNode;
    while (parentElement.children.length > 3) { // Giữ lại 3 phần tử ban đầu
        parentElement.removeChild(parentElement.lastChild);
    }
    
    // Tạo ID ẩn danh mới
    generateAnonymousVoteId();
}

function showAlert(element, message, type) {
    element.textContent = message;
    element.className = `alert alert-${type}`;
    element.classList.remove('hidden');
}
