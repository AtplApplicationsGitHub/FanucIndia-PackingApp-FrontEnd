import { Suspense } from "react";

import IbdUploadDetailScreen from "../../components/ibd/IbdUploadDetailScreen";

export default function IbdUploadDetailPage() {
  return (
    <Suspense fallback={null}>
      <IbdUploadDetailScreen />
    </Suspense>
  );
}
