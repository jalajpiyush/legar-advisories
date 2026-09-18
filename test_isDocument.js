const isDocument = (content) => {
  if (content.length < 50 || content.includes('"type": "dynamic_form"')) return false;
  if (/^#+\s/.test(content.trim())) return true;
  if (/(?:\*\*|#)\s*(?:AGREEMENT|AFFIDAVIT|NOTICE|DEED|CONTRACT|POWER OF ATTORNEY|CERTIFICATE|MEMORANDUM|PETITION|APPLICATION)/i.test(content)) return true;
  return false;
};

console.log(isDocument("# RENT AGREEMENT\n\nThis is...       sdfsdfdsfsdfdsf sdf sdf sdf sdf sdf sdf sdf sdf dsfsdfd sf sdf df "));
console.log(isDocument("Hello Sir, how may I assist you? dfg dfg dfg dfg df gfdg dfg dfg d dfgdf gdg dfg dfg dfg df gdfgdf dfg d d fg dgf  gdfg df g df"));
console.log(isDocument("Here is your info:\n\n**Notice of Eviction**\n\nWe are... sdf sdf sdf sdf sdf sdf sdf sdf dsfsdfd sf sdf df "));
