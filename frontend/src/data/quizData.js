export const APT_LEVELS = [
  {
    id: 'A1', name: 'NUMBER THEORY', diff: 'easy', questions: [
      { q: 'If a train travels 60 km in 45 minutes, what is its speed in km/h?', opts: ['75', '80', '72', '90'], ans: 1, exp: 'Speed = Distance/Time = 60 ÷ 0.75 = <b>80 km/h</b>' },
      { q: 'A shopkeeper sells an item at 20% profit. If the cost price is ₹250, what is the selling price?', opts: ['₹280', '₹290', '₹300', '₹310'], ans: 2, exp: 'Profit = 20% of 250 = 50. SP = 250 + 50 = <b>₹300</b>' },
      { q: 'What is the LCM of 12 and 18?', opts: ['24', '36', '48', '72'], ans: 1, exp: 'LCM(12,18) = <b>36</b>. Factor: 12=2²×3, 18=2×3². LCM=2²×3²=36' },
      { q: 'If 5 workers complete a job in 8 days, how many days will 10 workers take?', opts: ['3', '4', '5', '6'], ans: 1, exp: 'Work is inversely proportional. 5×8 = 10×d → d = <b>4 days</b>' },
      { q: 'Find the missing number: 2, 6, 12, 20, 30, ?', opts: ['36', '40', '42', '44'], ans: 2, exp: 'Differences: 4,6,8,10,<b>12</b>. So next = 30+12 = <b>42</b>' }
    ]
  },
  {
    id: 'A2', name: 'LOGICAL REASONING', diff: 'medium', questions: [
      { q: 'All roses are flowers. Some flowers fade quickly. Which conclusion is valid?', opts: ['All roses fade quickly', 'Some roses may fade quickly', 'No roses fade quickly', 'All flowers are roses'], ans: 1, exp: 'We can only conclude <b>"Some roses may fade quickly"</b> since some flowers (which include roses) fade quickly.' },
      { q: 'In a code language, APPLE is written as BQQMF. How is MANGO written?', opts: ['NBOQP', 'NBOHP', 'NBOIP', 'MBOIP'], ans: 1, exp: 'Each letter is shifted +1. M→N, A→B, N→O, G→H, O→P = <b>NBOHP</b>' },
      { q: 'A clock shows 3:15. What is the angle between the hour and minute hands?', opts: ['0°', '7.5°', '15°', '22.5°'], ans: 1, exp: 'At 3:15, minute hand is at 90°. Hour hand: 3×30 + 15×0.5 = 97.5°. Difference = <b>7.5°</b>' },
      { q: 'If FAST is coded as 6-1-19-20, what is the code for SLOW?', opts: ['19-12-15-23', '18-11-14-22', '20-13-16-24', '17-10-13-21'], ans: 0, exp: 'A=1, B=2... S=19, L=12, O=15, W=23. SLOW = <b>19-12-15-23</b>' },
      { q: 'Pointing to a photo, Ram says "Her mother is the only daughter of my father." How is Ram related to the girl in the photo?', opts: ['Brother', 'Uncle', 'Father', 'Grandfather'], ans: 2, exp: '"Only daughter of my father" = Ram\'s sister. Sister is the girl\'s mother. So Ram is the girl\'s <b>Uncle</b>.' }
    ]
  },
  {
    id: 'A3', name: 'DATA INTERPRETATION', diff: 'hard', questions: [
      { q: "A company's revenue grew 25% in Year 1 and fell 20% in Year 2. What is the net percentage change from the start?", opts: ['0%', '+5%', '-5%', 'No change'], ans: 0, exp: 'Start=100, after Y1=125, after Y2=125×0.8=100. Net change = <b>0%</b>' },
      { q: 'If the ratio of boys to girls in a class is 3:2 and total students are 40, how many girls are there?', opts: ['12', '16', '20', '24'], ans: 1, exp: 'Girls = (2/5)×40 = <b>16</b>' },
      { q: 'Two pipes fill a tank in 10 and 15 hours. Both open together, how long to fill the tank?', opts: ['5 hrs', '6 hrs', '8 hrs', '12 hrs'], ans: 1, exp: 'Combined rate = 1/10+1/15 = 5/30 = 1/6. Time = <b>6 hours</b>' },
      { q: 'A person walks 4 km North, then 3 km East. What is straight-line distance from start?', opts: ['5 km', '6 km', '7 km', '8 km'], ans: 0, exp: 'By Pythagoras: √(4²+3²) = √25 = <b>5 km</b>' },
      { q: 'Simple interest on ₹5000 at 8% per annum for 3 years is?', opts: ['₹1000', '₹1200', '₹1500', '₹1800'], ans: 1, exp: 'SI = P×R×T/100 = 5000×8×3/100 = <b>₹1200</b>' }
    ]
  }
];

export const ENG_LEVELS = [
  {
    id: 'E1', name: 'VOCABULARY', diff: 'easy', questions: [
      { q: 'Choose the synonym of ELOQUENT:', opts: ['Silent', 'Articulate', 'Confused', 'Rude'], ans: 1, exp: '"Eloquent" means well-spoken and persuasive. <b>Articulate</b> is the correct synonym.' },
      { q: 'Choose the antonym of BENEVOLENT:', opts: ['Kind', 'Generous', 'Malevolent', 'Charitable'], ans: 2, exp: '"Benevolent" means kind/generous. Its antonym is <b>Malevolent</b> (wishing harm).' },
      { q: 'Fill in the blank: The scientist made a remarkable _____ in cancer research.', opts: ['breakdown', 'breakout', 'breakthrough', 'breakup'], ans: 2, exp: 'A <b>breakthrough</b> means a significant discovery or achievement.' },
      { q: 'Which word is spelled correctly?', opts: ['Accomodate', 'Accommodate', 'Accommadate', 'Acomodate'], ans: 1, exp: "The correct spelling is <b>Accommodate</b> (two c's and two m's)." },
      { q: 'EPHEMERAL means:', opts: ['Eternal', 'Short-lived', 'Extraordinary', 'Powerful'], ans: 1, exp: '<b>Ephemeral</b> means lasting for a very short time (e.g., ephemeral beauty).' }
    ]
  },
  {
    id: 'E2', name: 'GRAMMAR & USAGE', diff: 'medium', questions: [
      { q: 'Identify the error: "Each of the students have submitted their assignment."', opts: ['Each', 'have', 'submitted', 'their'], ans: 1, exp: '"Each" is singular, so the verb should be <b>"has"</b> not "have".' },
      { q: 'Choose the correct sentence:', opts: ['She is more smarter than him.', 'She is smarter than him.', 'She is most smart than him.', 'She smarter than him.'], ans: 1, exp: 'Double comparatives are wrong. <b>"She is smarter than him"</b> is correct.' },
      { q: '"The book _____ on the table belongs to me." Choose the correct form:', opts: ['lay', 'lied', 'lying', 'laid'], ans: 2, exp: 'Present participle "lying" is used for something currently positioned. <b>Lying</b> on the table.' },
      { q: 'Which sentence uses the passive voice correctly?', opts: ['The dog chased the cat.', 'The cat was chased by the dog.', 'The cat chased the dog.', 'The dog is chasing the cat.'], ans: 1, exp: '<b>"The cat was chased by the dog"</b> is in passive voice — subject receives the action.' },
      { q: 'Choose the correct conjunction: "She studied hard, _____ she failed the exam."', opts: ['so', 'because', 'yet', 'and'], ans: 2, exp: '"Yet" shows contrast — despite studying hard, she failed. <b>Yet</b> is correct.' }
    ]
  },
  {
    id: 'E3', name: 'READING COMPREHENSION', diff: 'hard', questions: [
      { q: 'What does the idiom "Bite the bullet" mean?', opts: ['To eat something hard', 'To endure a painful situation bravely', 'To shoot someone', 'To be aggressive'], ans: 1, exp: '"Bite the bullet" means to <b>endure a painful or difficult situation bravely</b>.' },
      { q: 'A "red herring" in an argument is:', opts: ['A relevant point', 'A misleading clue or distraction', 'A factual error', 'A strong argument'], ans: 1, exp: 'A <b>red herring</b> is something that misleads or distracts from the main issue.' },
      { q: '"The pen is mightier than the sword" implies:', opts: ['Pens are better weapons', 'Writing has more power than violence', 'Swords are useless', 'Kings prefer writing'], ans: 1, exp: 'The proverb means <b>communication and ideas have more influence than brute force</b>.' },
      { q: 'Choose the correctly punctuated sentence:', opts: ["It's a beautiful day, isn't it?", 'Its a beautiful day, isnt it?', "It's a beautiful day isnt it?", "Its a beautiful day, isn't it?"], ans: 0, exp: '<b>"It\'s a beautiful day, isn\'t it?"</b> — contractions need apostrophes.' },
      { q: 'The word "UBIQUITOUS" most nearly means:', opts: ['Rare', 'Unique', 'Found everywhere', 'Invisible'], ans: 2, exp: '"Ubiquitous" means <b>present, appearing, or found everywhere</b>.' }
    ]
  }
];
