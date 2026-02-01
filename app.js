// SchemeFinder India - Main Application Logic

let currentStep = 1;
const totalSteps = 5;
let formData = {};
let allSchemes = [];

// ==================== Progress & Navigation ====================

function updateProgress() {
    const indicators = document.querySelectorAll('.step-indicator');
    const line = document.getElementById('progressLine');
    
    indicators.forEach((ind, i) => {
        ind.classList.remove('active', 'completed');
        if (i + 1 < currentStep) ind.classList.add('completed');
        if (i + 1 === currentStep) ind.classList.add('active');
    });
    
    line.style.width = ((currentStep - 1) / (totalSteps - 1) * 100) + '%';
}

function changeStep(dir) {
    const currentForm = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    
    if (dir > 0 && !validateStep(currentStep)) return;
    
    currentForm.classList.remove('active');
    currentStep += dir;
    document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
    
    document.getElementById('prevBtn').disabled = currentStep === 1;
    document.getElementById('nextBtn').style.display = currentStep === totalSteps ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = currentStep === totalSteps ? 'block' : 'none';
    
    updateProgress();
}

function validateStep(step) {
    const stepEl = document.querySelector(`.form-step[data-step="${step}"]`);
    const required = stepEl.querySelectorAll('[required]');
    let valid = true;
    
    required.forEach(el => {
        if (!el.value) {
            el.style.borderColor = '#ef4444';
            valid = false;
        } else {
            el.style.borderColor = '';
        }
    });
    
    return valid;
}

// ==================== Form Handling ====================

function toggleOccupationFields() {
    const occ = document.getElementById('occupation').value;
    document.getElementById('occupationSpecify').style.display = occ === 'other' ? 'block' : 'none';
}

function collectFormData() {
    formData = {
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        mobile: document.getElementById('mobile').value,
        email: document.getElementById('email').value,
        category: document.getElementById('category').value,
        religion: document.getElementById('religion').value,
        state: document.getElementById('state').value,
        district: document.getElementById('district').value,
        income: document.getElementById('income').value,
        bplStatus: document.getElementById('bplStatus').value,
        occupation: document.getElementById('occupation').value,
        educationLevel: document.getElementById('educationLevel').value,
        stream: document.getElementById('stream').value,
        currentYear: document.getElementById('currentYear').value,
        board: document.getElementById('board').value
    };
}

// ==================== Scheme Fetching & Matching ====================

async function fetchSchemes() {
    collectFormData();
    
    document.getElementById('wizardContainer').style.display = 'none';
    document.getElementById('loading').classList.add('active');
    
    try {
        const schemes = await fetchFromJina();
        allSchemes = matchSchemes(schemes);
        displaySchemes(allSchemes);
    } catch (e) {
        console.error('Error fetching schemes:', e);
        allSchemes = matchSchemes(getSampleSchemes());
        displaySchemes(allSchemes);
    }
    
    document.getElementById('loading').classList.remove('active');
    document.getElementById('resultsSection').classList.add('active');
}

async function fetchFromJina() {
    const urls = [
        'https://scholarships.gov.in',
        'https://www.myscheme.gov.in',
        'https://www.buddy4study.com/scholarships'
    ];
    
    let schemes = [];
    
    for (const url of urls) {
        try {
            const resp = await fetch(`https://r.jina.ai/${url}`, {
                headers: { 'Accept': 'text/plain' }
            });
            
            if (resp.ok) {
                const text = await resp.text();
                schemes = schemes.concat(parseSchemes(text, url));
            }
        } catch (e) {
            console.log('Fallback for', url);
        }
    }
    
    return schemes.length > 0 ? schemes : getSampleSchemes();
}

function parseSchemes(text, source) {
    const schemes = [];
    const lines = text.split('\n');
    let current = null;
    
    lines.forEach(line => {
        if (line.match(/scholarship|scheme|yojana|fellowship/i) && line.length > 20 && line.length < 150) {
            if (current) schemes.push(current);
            current = {
                name: line.trim(),
                source: source,
                amount: 'Varies',
                deadline: 'Check portal',
                category: 'scholarship',
                eligibility: 'Check eligibility on portal',
                howToApply: 'Visit the official portal to apply online',
                link: source
            };
        }
    });
    
    if (current) schemes.push(current);
    return schemes;
}

function getSampleSchemes() {
    return [
        {
            name: 'National Scholarship Portal - Post Matric Scholarship for SC Students',
            amount: 'Up to ₹1,00,000/year',
            deadline: '31st Dec 2026',
            category: 'scholarship',
            eligibility: 'SC category, Family income below ₹2.5 Lakh, Post-matric education',
            howToApply: '1. Register on scholarships.gov.in\n2. Fill application form\n3. Upload documents\n4. Submit for verification',
            link: 'https://scholarships.gov.in',
            source: 'scholarships.gov.in'
        },
        {
            name: 'PM-KISAN Samman Nidhi Yojana',
            amount: '₹6,000/year',
            deadline: 'Open throughout year',
            category: 'subsidy',
            eligibility: 'All farmer families with cultivable land, Valid Aadhaar',
            howToApply: '1. Visit pmkisan.gov.in\n2. New Farmer Registration\n3. Enter Aadhaar and land details\n4. Submit application',
            link: 'https://pmkisan.gov.in',
            source: 'myscheme.gov.in'
        },
        {
            name: 'Pradhan Mantri Mudra Yojana',
            amount: 'Loan up to ₹10 Lakh',
            deadline: 'Always Open',
            category: 'loan',
            eligibility: 'Small business owners, Entrepreneurs, Non-farm enterprises',
            howToApply: '1. Approach nearest bank branch\n2. Submit business plan\n3. Provide KYC documents\n4. Loan sanctioned within 7-10 days',
            link: 'https://www.mudra.org.in',
            source: 'myscheme.gov.in'
        },
        {
            name: 'Central Sector Scholarship for College Students',
            amount: '₹12,000/year',
            deadline: '31st Oct 2026',
            category: 'scholarship',
            eligibility: '80th percentile in Class 12, Family income below ₹8 Lakh',
            howToApply: '1. Register on NSP portal\n2. Select Central Sector Scheme\n3. Upload marksheet & income certificate\n4. Institute verification required',
            link: 'https://scholarships.gov.in',
            source: 'scholarships.gov.in'
        },
        {
            name: 'PM Vishwakarma Yojana',
            amount: 'Loan up to ₹3 Lakh + Training',
            deadline: 'Open',
            category: 'grant',
            eligibility: 'Traditional artisans and craftsmen, 18 families of trades',
            howToApply: '1. Register on pmvishwakarma.gov.in\n2. Verify with Aadhaar OTP\n3. Select your trade\n4. Apply for recognition & benefits',
            link: 'https://pmvishwakarma.gov.in',
            source: 'myscheme.gov.in'
        },
        {
            name: 'AICTE Pragati Scholarship for Girls',
            amount: '₹50,000/year',
            deadline: '31st Dec 2026',
            category: 'scholarship',
            eligibility: 'Female students in technical education, Family income below ₹8 Lakh',
            howToApply: '1. Apply through AICTE portal\n2. Upload admission proof\n3. Income certificate required\n4. Verification by institute',
            link: 'https://scholarships.gov.in',
            source: 'scholarships.gov.in'
        },
        {
            name: 'Stand Up India Scheme',
            amount: 'Loan ₹10 Lakh to ₹1 Crore',
            deadline: 'Always Open',
            category: 'loan',
            eligibility: 'SC/ST/Women entrepreneurs, At least 51% stake in enterprise',
            howToApply: '1. Visit standupmitra.in\n2. Register and submit business plan\n3. Connect with bank\n4. Get loan approval',
            link: 'https://www.standupmitra.in',
            source: 'myscheme.gov.in'
        },
        {
            name: 'Begum Hazrat Mahal National Scholarship',
            amount: '₹10,000 - ₹12,000/year',
            deadline: '30th Sep 2026',
            category: 'scholarship',
            eligibility: 'Minority girls, Class 9-12, Family income below ₹2 Lakh',
            howToApply: '1. Apply through Maulana Azad Foundation portal\n2. Submit marksheet and minority certificate\n3. Institute verification\n4. Amount credited to bank',
            link: 'https://maef.nic.in',
            source: 'scholarships.gov.in'
        },
        {
            name: 'National Apprenticeship Training Scheme',
            amount: 'Stipend ₹5,000-₹9,000/month',
            deadline: 'Rolling',
            category: 'grant',
            eligibility: 'ITI/Diploma/Graduate pass, Age 16-25 years',
            howToApply: '1. Register on apprenticeshipindia.gov.in\n2. Search for opportunities\n3. Apply to establishments\n4. Sign apprenticeship contract',
            link: 'https://apprenticeshipindia.gov.in',
            source: 'myscheme.gov.in'
        },
        {
            name: 'Rashtriya Krishi Vikas Yojana',
            amount: 'Varies by project',
            deadline: 'Check state portal',
            category: 'subsidy',
            eligibility: 'Farmers, Farmer Producer Organizations, Agri-entrepreneurs',
            howToApply: '1. Contact District Agriculture Office\n2. Submit project proposal\n3. Get approval from SLSC\n4. Implement and claim subsidy',
            link: 'https://rkvy.nic.in',
            source: 'myscheme.gov.in'
        }
    ];
}

function matchSchemes(schemes) {
    return schemes.map(s => {
        let score = 50;
        
        // Occupation-based matching
        if (formData.occupation === 'student' && s.category === 'scholarship') score += 25;
        if (formData.occupation === 'farmer' && s.name.toLowerCase().includes('kisan')) score += 30;
        if (formData.occupation === 'businessman' && (s.category === 'loan' || s.name.toLowerCase().includes('mudra'))) score += 25;
        
        // Category-based matching
        if (['sc', 'st'].includes(formData.category) && s.eligibility.toLowerCase().includes(formData.category)) score += 20;
        
        // BPL status
        if (formData.bplStatus === 'bpl') score += 10;
        
        // Gender-based matching
        if (formData.gender === 'female' && s.name.toLowerCase().includes('girl')) score += 15;
        
        // Add some randomness for variety
        score = Math.min(98, score + Math.floor(Math.random() * 10));
        
        return { ...s, matchScore: score };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
}

// ==================== Display & UI ====================

function displaySchemes(schemes) {
    const container = document.getElementById('schemesContainer');
    container.innerHTML = '';
    document.getElementById('schemeCount').textContent = schemes.length;
    
    if (!schemes.length) {
        container.innerHTML = '<div class="no-results"><p>No schemes found matching your profile. Try adjusting your filters.</p></div>';
        return;
    }
    
    schemes.forEach((s, i) => {
        container.innerHTML += `
            <div class="scheme-card">
                <span class="match-badge">${s.matchScore}% Match</span>
                <span class="category-tag">${s.category.toUpperCase()}</span>
                <h3 class="scheme-title">${s.name}</h3>
                <div class="scheme-meta">
                    <span>💰 ${s.amount}</span>
                    <span>📅 ${s.deadline}</span>
                    <span>🌐 ${s.source || 'Gov Portal'}</span>
                </div>
                <p class="scheme-desc"><strong>Eligibility:</strong> ${s.eligibility}</p>
                <button class="expand-btn" onclick="toggleHowTo(${i})">▼ How to Apply</button>
                <div class="how-to-apply" id="howTo${i}">
                    <pre style="white-space:pre-wrap;font-family:inherit">${s.howToApply}</pre>
                    <a href="${s.link}" target="_blank" class="apply-btn">Apply Now →</a>
                </div>
            </div>
        `;
    });
}

function toggleHowTo(i) {
    const el = document.getElementById('howTo' + i);
    el.classList.toggle('show');
}

// ==================== Filtering & Sorting ====================

function filterSchemes() {
    const cat = document.getElementById('categoryFilter').value;
    const filtered = cat === 'all' ? allSchemes : allSchemes.filter(s => s.category === cat);
    displaySchemes(filtered);
}

function sortSchemes() {
    const by = document.getElementById('sortBy').value;
    let sorted = [...allSchemes];
    
    if (by === 'match') {
        sorted.sort((a, b) => b.matchScore - a.matchScore);
    } else if (by === 'amount') {
        sorted.sort((a, b) => {
            const getNum = s => {
                const m = s.amount.match(/(\d+)/);
                return m ? parseInt(m[1]) : 0;
            };
            return getNum(b) - getNum(a);
        });
    }
    
    displaySchemes(sorted);
}

// ==================== Export & Reset ====================

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('SchemeFinder India - Results', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated for: ${formData.name}`, 20, 35);
    doc.text(`Category: ${formData.category.toUpperCase()} | Occupation: ${formData.occupation}`, 20, 42);
    
    let y = 55;
    allSchemes.slice(0, 8).forEach((s, i) => {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(11);
        doc.text(`${i + 1}. ${s.name.substring(0, 60)}...`, 20, y);
        doc.setFontSize(9);
        doc.text(`   Amount: ${s.amount} | Match: ${s.matchScore}%`, 20, y + 6);
        doc.text(`   Deadline: ${s.deadline}`, 20, y + 12);
        y += 22;
    });
    
    doc.save('SchemeFinder_Results.pdf');
}

function resetForm() {
    document.getElementById('resultsSection').classList.remove('active');
    document.getElementById('wizardContainer').style.display = 'block';
    
    currentStep = 1;
    document.querySelectorAll('.form-step').forEach((el, i) => {
        el.classList.toggle('active', i === 0);
    });
    
    document.getElementById('prevBtn').disabled = true;
    document.getElementById('nextBtn').style.display = 'block';
    document.getElementById('submitBtn').style.display = 'none';
    
    updateProgress();
}

// ==================== Initialize ====================

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('schemeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        fetchSchemes();
    });
});
