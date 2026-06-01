const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/jspdf.es.min-cv4HcmuD.js","assets/index-ByHjpijU.js","assets/index-37lcBIxf.css"])))=>i.map(i=>d[i]);
import{r as g,a as j,j as n,P as C,S as E,_ as h}from"./index-ByHjpijU.js";const u="Aabha Trusted Gynaecology Care",w="Clinic Management System";function R(s){return s?new Date(s).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:!0}):"—"}function m(s){return s?new Date(s).toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"}):""}function I(s){const i=new Date(s);return`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`}function F(){const s=I(new Date),[i,T]=g.useState(s),[e,b]=g.useState(null),[f,y]=g.useState(!1),[S,x]=g.useState(""),_=g.useCallback(async o=>{var a,l;y(!0),x(""),b(null);try{const t=await j.dailyPatientReport(o);b(t.data.data)}catch(t){x(((l=(a=t.response)==null?void 0:a.data)==null?void 0:l.message)||"Failed to load report")}finally{y(!1)}},[]),v=()=>{if(!i){x("Please select a date");return}_(i)},P=()=>{var a;if(!((a=e==null?void 0:e.groups)!=null&&a.length))return[];let o=0;return e.groups.flatMap(l=>l.patients.map(t=>(o+=1,{sr:o,patientName:t.name,mobile:t.phone||"—",regTime:R(t.registrationTime),billAmount:Number(t.totalAmount||0)})))},A=()=>{var o;(o=e==null?void 0:e.groups)!=null&&o.length&&D()},D=async()=>{var c,d;if(!((c=e==null?void 0:e.groups)!=null&&c.length))return;const[{jsPDF:o},{default:a}]=await Promise.all([h(()=>import("./jspdf.es.min-cv4HcmuD.js").then(r=>r.j),__vite__mapDeps([0,1,2])),h(()=>import("./jspdf.plugin.autotable-CyVc7Jkq.js"),[])]),l=P(),t=new o({unit:"pt",format:"a4"});t.setFontSize(18),t.text(u,40,46),t.setFontSize(10),t.setTextColor(90,90,90),t.text(w,40,62),t.setTextColor(30,30,30),t.setFontSize(13),t.text(`Daily Patient Report - ${m(i)}`,40,84),a(t,{startY:96,head:[["Sr","Patient Name","Mobile","Reg Time","Bill Amount"]],body:l.map(r=>[String(r.sr),r.patientName,r.mobile,r.regTime,`Rs ${r.billAmount.toLocaleString("en-IN")}`]),styles:{fontSize:9,cellPadding:5},headStyles:{fillColor:[32,69,113]},columnStyles:{4:{halign:"right"}},margin:{left:40,right:40}});const p=((d=t.lastAutoTable)==null?void 0:d.finalY)||110;t.setFontSize(11),t.text(`Total Patients: ${e.totalPatients}`,40,p+24),t.text(`Total Collection: Rs ${Number(e.totalCollection||0).toLocaleString("en-IN")}`,40,p+42),t.save(`Daily-Patient-Report-${i}.pdf`)},k=async()=>{var c;if(!((c=e==null?void 0:e.groups)!=null&&c.length))return;const o=await h(()=>import("./xlsx-D_0l8YDs.js"),[]),a=P().map(d=>({Sr:d.sr,"Patient Name":d.patientName,Mobile:d.mobile,"Registration Time":d.regTime,"Bill Amount":d.billAmount})),l=o.utils.book_new(),t=o.utils.json_to_sheet(a);o.utils.book_append_sheet(l,t,"Daily Report");const p=o.utils.aoa_to_sheet([["Hospital",u],["Report Date",m(i)],["Total Patients",e.totalPatients],["Total Collection",Number(e.totalCollection||0)]]);o.utils.book_append_sheet(l,p,"Summary"),o.writeFile(l,`Daily-Patient-Report-${i}.xlsx`)},z=()=>{if(!e)return;const o=window.open("","_blank");let a=0;const l=e.groups.map(p=>{const c=p.patients.reduce((r,$)=>r+$.totalAmount,0),d=p.patients.map(r=>(a++,`
            <tr>
              <td>${a}</td>
              <td class="name">${r.name}</td>
              <td>${r.phone}</td>
              <td>${R(r.registrationTime)}</td>
              <td class="amt">₹${r.totalAmount}</td>
            </tr>
          `)).join("");return`
        <div class="doctor-block">

          <div class="doctor-title">
            Clinic: ${p.doctor}
          </div>

          <table>
            <thead>
              <tr>
                <th>Sr</th>
                <th>Patient Name</th>
                <th>Mobile</th>
                <th>Reg Time</th>
                <th class="right">Bill Amount</th>
              </tr>
            </thead>

            <tbody>
              ${d}
            </tbody>
          </table>

          <div class="doc-summary">
            Total Patients: ${p.patients.length}
            &nbsp;&nbsp; | &nbsp;&nbsp;
            Collection: ₹${c}
          </div>

        </div>
        `}).join(""),t=`
    <html>
    <head>

      <title>Daily Patient Report</title>

      <style>

      body{
        font-family: 'Segoe UI', Arial;
        margin:30px;
        color:#222;
      }

      .header{
        text-align:center;
        border-bottom:2px solid #0A2342;
        padding-bottom:10px;
        margin-bottom:20px;
      }

      .header h1{
        margin:0;
        font-size:26px;
        color:#0A2342;
      }

      .header p{
        margin:2px;
        color:#666;
        font-size:13px;
      }

      .report-title{
        font-size:18px;
        font-weight:600;
        margin-top:6px;
      }

      .report-date{
        font-size:13px;
        color:#777;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:8px;
      }

      th{
        background:#f3f6f9;
        padding:7px;
        border:1px solid #ddd;
        font-size:13px;
        text-transform:uppercase;
      }

      td{
        padding:6px;
        border:1px solid #eee;
        font-size:13px;
      }

      .right{
        text-align:right;
      }

      .name{
        font-weight:600;
      }

      .amt{
        text-align:right;
        font-weight:600;
        color:#00695C;
      }

      .doctor-block{
        margin-bottom:25px;
        border:1px solid #ddd;
        border-radius:4px;
        overflow:hidden;
      }

      .doctor-title{
        background:#0A2342;
        color:white;
        padding:6px 10px;
        font-weight:600;
        font-size:13px;
      }

      .doc-summary{
        background:#f7f9fb;
        padding:6px 10px;
        font-weight:600;
        font-size:12px;
        text-align:right;
      }

      .grand{
        margin-top:25px;
        padding:12px;
        border:2px solid #0A2342;
        font-weight:700;
        font-size:15px;
        background:#f9fbfd;
      }

      @page{
        size:A4;
        margin:15mm;
      }

      </style>

    </head>

    <body>

      <div class="header">
        <h1>${u}</h1>
        <p>${w}</p>
        <div class="report-title">Daily Patient Report</div>
        <div class="report-date">${m(i)}</div>
      </div>

      ${l}

      <div class="grand">
        Total Patients : ${e.totalPatients} <br/>
        Total Collection : ₹${e.totalCollection}
      </div>

    </body>
    </html>
    `;o.document.open(),o.document.write(t),o.document.close(),o.onload=function(){o.print()}};return n.jsxs("div",{style:{padding:30,fontFamily:"Segoe UI, Arial",background:"#f5f7fb",minHeight:"100vh"},children:[n.jsx(C,{title:"Daily Patient Report",subtitle:"Generate & print the daily patient report"}),n.jsxs("div",{style:{marginTop:20,marginBottom:25,padding:"15px 18px",background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"},children:[n.jsx("label",{style:{fontWeight:600,fontSize:14,color:"#333"},children:"Select Date :"}),n.jsx("input",{type:"date",value:i,max:s,onChange:o=>T(o.target.value),style:{padding:"6px 10px",border:"1px solid #ccc",borderRadius:4,fontSize:13}}),n.jsx("button",{onClick:v,style:{padding:"7px 14px",background:"#204571",color:"#fff",border:"none",borderRadius:4,fontSize:13,cursor:"pointer"},children:f?"Loading...":"Generate Report"}),e&&e.groups.length>0&&n.jsxs(n.Fragment,{children:[n.jsx("button",{onClick:A,style:{padding:"7px 14px",background:"#00695C",color:"#fff",border:"none",borderRadius:4,fontSize:13,cursor:"pointer"},children:"Export PDF"}),n.jsx("button",{onClick:k,style:{padding:"7px 14px",background:"#1565C0",color:"#fff",border:"none",borderRadius:4,fontSize:13,cursor:"pointer"},children:"Export Excel"}),n.jsx("button",{onClick:z,style:{padding:"7px 14px",background:"#424242",color:"#fff",border:"none",borderRadius:4,fontSize:13,cursor:"pointer"},children:"Print Preview"})]})]}),S&&n.jsx("div",{style:{background:"#fdecea",color:"#d32f2f",padding:"10px 14px",borderRadius:6,border:"1px solid #f5c2c2",marginBottom:20,fontSize:13},children:S}),f&&n.jsx("div",{style:{marginTop:20},children:n.jsx(E,{})}),e&&!f&&n.jsxs("div",{style:{background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,padding:20},children:[n.jsxs("h3",{style:{marginBottom:10,color:"#0A2342",fontSize:18},children:[u," - Daily Patient Report (",m(i),")"]}),n.jsxs("p",{style:{fontSize:14,fontWeight:600,color:"#00695C"},children:["Total Patients : ",e.totalPatients]})]})]})}export{F as default};
