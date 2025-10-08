'use client';
import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/header';

export default function Verify() {
  const [payload, setPayload] = useState('{}');
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const verify = (payload: any) => axios.post(`${process.env.NEXT_PUBLIC_VERIFY_API_URL}`, payload);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const parsed = JSON.parse(payload);
      const r = await verify(parsed);
      setLoading(false);
      setResp(r.data);
    } catch (err: any) {
      setLoading(false);
      setResp({ error: err.message || 'error' });
    }
  };
  return (
    <div className="p-10">
      <Header />
      <h2>Verify Credential</h2>
      <form onSubmit={onSubmit}>
        <textarea className="w-full border" value={payload} onChange={e => setPayload(e.target.value)} rows={6} cols={60} />
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading? "Loading..." : "Submit"}</button>
      </form>
      {resp && <pre>{JSON.stringify(resp, null, 2)}</pre>}
    </div>
  );
}
